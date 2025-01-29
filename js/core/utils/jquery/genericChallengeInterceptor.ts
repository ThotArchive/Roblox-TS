/* eslint-disable no-param-reassign */
import $ from 'jquery';
import Roblox from 'Roblox';

let initialized = false;

const initializeGenericChallengeInterceptor = (forceInit?: boolean) => {
  if (!forceInit && initialized) return;
  // JQuery AJAX client-side error response interceptor for the Generic Challenge
  // Service.
  $.ajaxPrefilter((options: JQueryAjaxSettings) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalErrorHandler = options.error;
    options.error = (jQueryXhr, textStatus, errorThrown) => {
      const GENERIC_CHALLENGE_LOG_PREFIX = 'Generic Challenge:';
      const GENERIC_CHALLENGE_ID_HEADER = 'rblx-challenge-id';
      const GENERIC_CHALLENGE_TYPE_HEADER = 'rblx-challenge-type';
      const GENERIC_CHALLENGE_METADATA_HEADER = 'rblx-challenge-metadata';
      const GENERIC_CHALLENGE_CONTAINER_ID = 'generic-challenge-container';

      // Parsing headers to a key-value map as per MDN web docs:
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
      const headers = jQueryXhr.getAllResponseHeaders();
      const headerMap: { [header: string]: string } = {};
      if (headers) {
        // Convert the header string into an array
        // of individual headers
        const arr = headers.trim().split(/[\r\n]+/);
        arr.forEach((line: string) => {
          const parts = line.split(': ');
          const header = parts.shift();
          const value = parts.join(': ');
          headerMap[header] = value;
        });
      }
      const {
        [GENERIC_CHALLENGE_ID_HEADER]: challengeId,
        [GENERIC_CHALLENGE_TYPE_HEADER]: challengeTypeRaw,
        [GENERIC_CHALLENGE_METADATA_HEADER]: challengeMetadataJsonBase64
      } = headerMap;

      const anyChallengeHeaderFound =
        challengeId !== undefined ||
        challengeTypeRaw !== undefined ||
        challengeMetadataJsonBase64 !== undefined;
      const challengeAvailable =
        challengeId !== undefined &&
        challengeTypeRaw !== undefined &&
        challengeMetadataJsonBase64 !== undefined;
      if (challengeAvailable) {
        if (Roblox && Roblox.AccountIntegrityChallengeService) {
          // The Promise return value here is unused (the request will be retried
          // or failed within its body).
          // eslint-disable-next-line no-void
          void Roblox.AccountIntegrityChallengeService.Generic.interceptChallenge({
            retryRequest: (challengeIdInner, redemptionMetadataJsonBase64) => {
              options.headers = {
                ...options.headers,
                [GENERIC_CHALLENGE_ID_HEADER]: challengeIdInner,
                [GENERIC_CHALLENGE_TYPE_HEADER]: challengeTypeRaw,
                [GENERIC_CHALLENGE_METADATA_HEADER]: redemptionMetadataJsonBase64
              };
              // The Promise return value here is unused (this retry will call
              // success or error handlers internally).
              // eslint-disable-next-line no-void
              void $.ajax(options);
              return undefined;
            },
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64
          }).catch(error => {
            // GCS error occurred; pass the error to the saved base handler.
            if (originalErrorHandler !== undefined) {
              originalErrorHandler(jQueryXhr, 'error', error);
            }
          });
          return;
        }
        // eslint-disable-next-line no-console
        console.error(
          GENERIC_CHALLENGE_LOG_PREFIX,
          'Got challenge but challenge component not available'
        );
      } else if (anyChallengeHeaderFound) {
        // eslint-disable-next-line no-console
        console.error(GENERIC_CHALLENGE_LOG_PREFIX, 'Got only partial challenge headers');
      }

      // No challenge found; pass the error to the saved base handler.
      if (originalErrorHandler !== undefined) {
        originalErrorHandler(jQueryXhr, textStatus, errorThrown);
      }
    };

    return options;
  });
  initialized = true;
};

// The GCS jquery interceptor initializes itself at most once on import.
if (!initialized) {
  initializeGenericChallengeInterceptor();
}

export default initializeGenericChallengeInterceptor;
