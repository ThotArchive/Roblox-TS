import $ from 'jquery';
import { CurrentUser } from 'Roblox';
import hbaMetaConstants from '../../../utilities/boundAuthTokens/constants/hbaMeta';
import { buildConfigBoundAuthToken } from '../../../utilities/boundAuthTokens/http/boundAuthTokensHttpUtil';

// Sampling constant.
const ONE_MILLION = 1_000_000;

// Expected key in whitelist for jQuery rollout.
const JQUERY_PSEUDO_API_SITE_KEY = 'jQuery';

type BatWhitelistApiSampling = {
  apiSite: string;
  sampleRate: string;
};

type BatWhitelistWrapper = {
  Whitelist: BatWhitelistApiSampling[];
};

// Code that abuses the existing HBA meta tag to derive a per-million rollout of the jQuery
// interceptor (based on user ID).
let jQueryRolloutPerMillion = 0;
try {
  const hbaMeta = hbaMetaConstants.getHbaMeta();
  if (hbaMeta && hbaMeta.boundAuthTokenWhitelist) {
    const batWhitelistWrapper = JSON.parse(hbaMeta.boundAuthTokenWhitelist) as BatWhitelistWrapper;
    const batWhitelist = batWhitelistWrapper.Whitelist;
    for (let i = 0; i < batWhitelist.length; i += 1) {
      const apiSampling = batWhitelist[i];
      if (apiSampling.apiSite === JQUERY_PSEUDO_API_SITE_KEY) {
        // Avoid negative numbers and NaN.
        jQueryRolloutPerMillion = Math.max(0, parseInt(apiSampling.sampleRate, 10) || 0);
        break;
      }
    }
  }
} catch (e) {
  // Not expected to happen.
  // eslint-disable-next-line no-console
  console.error('jQuery rollout calculation error:', e);
}

// Pre-compute the current user ID hashed per million.
let currentUserIdHashedPerMillion: number | null = null;
try {
  if (CurrentUser) {
    const userId = parseInt(CurrentUser.userId, 10);
    // Ignore spurious user IDs.
    if (Number.isNaN(userId) || userId <= 0) {
      currentUserIdHashedPerMillion = null;
    } else {
      currentUserIdHashedPerMillion = userId % ONE_MILLION;
    }
  }
} catch (e) {
  // Not expected to happen.
  // eslint-disable-next-line no-console
  console.error('CurrentUser hash calculation error:', e);
}

const shouldInitializeJQueryInterceptor = (): boolean => {
  if (jQueryRolloutPerMillion === ONE_MILLION) {
    return true;
  }
  if (currentUserIdHashedPerMillion === null) {
    return false;
  }
  return currentUserIdHashedPerMillion < jQueryRolloutPerMillion;
};

// After much trawling of jQuery documentation, there is no simple way to have an asynchronous
// operation always run before all jQuery requests globally. This is our best-effort as of 2024.
const initializeBoundAuthTokensForJQuery = (): void => {
  $.ajaxPrefilter((options: JQueryAjaxSettings) => {
    // 1. Kick off the Promise to generate BAT headers if necessary.
    // Here, we map jQuery HTTP config to the more standard format used by React and Angular.
    const method = options.method || 'GET';
    const configPromise = buildConfigBoundAuthToken({
      url: options.url,
      withCredentials: (options?.xhrFields?.withCredentials as boolean) || false,
      // TODO: Differentiate between added and passed headers in the Promise's return value if BAT
      // generation ever needs to make use of passed headers.
      headers: {},
      method,
      // Unlike Angular and React, both query parameters and body parameters are stored in `data`.
      // For BAT purposes, we only care about body parameters.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: method === 'GET' ? undefined : options.data
    });

    // 2. Override the current jQuery XMLHttpRequest constructor with an XMLHttpRequest constructor
    // that waits to inject BAT headers on `send`.
    const originalXhr = (options.xhr || $.ajaxSettings.xhr) as () => XMLHttpRequest;
    // eslint-disable-next-line no-param-reassign
    options.xhr = () => {
      // 3. Within the constructor override, start by instantiating the current XMLHttpRequest-like
      // object (the default behavior of this function option).
      const xhr = originalXhr();

      // 3. Save the original unbound `send` method from the XMLHttpRequest-like instance.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalSend = xhr.send;

      // 4. Replace the `send` method with one that waits for the BAT headers to be generated, then
      // uses `originalSend` to issue the desired request.
      xhr.send = (...args) => {
        // eslint-disable-next-line no-void
        void configPromise
          .then(config => {
            try {
              Object.keys(config.headers).forEach(key => {
                xhr.setRequestHeader(key, config.headers[key].toString());
              });
            } catch (e) {
              // Not expected (only should happen if `send` was called previously).
              // eslint-disable-next-line no-console
              console.error('Could not set BAT headers:', e);
            }
          })
          .finally(() => {
            originalSend.apply(xhr, args);
          });
      };

      // 5. Return the overridden instance.
      return xhr;
    };
  });
};

// This interceptor initializes itself at most once on import.
let initialized = false;
if (!initialized && shouldInitializeJQueryInterceptor()) {
  initialized = true;
  initializeBoundAuthTokensForJQuery();
}