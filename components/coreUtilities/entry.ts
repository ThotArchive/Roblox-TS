import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as endpoints from "@rbx/core-scripts/endpoints";
import * as fmtNumber from "@rbx/core-scripts/format/number";
import * as fmtString from "@rbx/core-scripts/format/string";
import * as http from "@rbx/core-scripts/http";
import * as httpUtil from "@rbx/core-scripts/http/util";
import * as accessibility from "@rbx/core-scripts/util/accessibility";
import * as batchRequest from "@rbx/core-scripts/util/batch-request";
import * as currentBrowser from "@rbx/core-scripts/util/current-browser";
import * as cursorPagination from "@rbx/core-scripts/util/cursor-pagination";
import * as date from "@rbx/core-scripts/util/date";
import * as pageName from "@rbx/core-scripts/util/page-name";
import * as ready from "@rbx/core-scripts/util/ready";
import * as url from "@rbx/core-scripts/util/url";
import * as boundAuth from "@rbx/core-scripts/auth/bound-auth";
import * as crypto from "@rbx/core-scripts/auth/crypto";
import * as fido2 from "@rbx/core-scripts/auth/fido2";
import * as hba from "@rbx/core-scripts/auth/hba";
import * as hybridResponse from "@rbx/core-scripts/auth/hybrid-response";
import * as sai from "@rbx/core-scripts/auth/sai";
import * as dataStore from "@rbx/core-scripts/data-store";
import * as deepLink from "@rbx/core-scripts/deep-link";
import * as entityUrl from "@rbx/core-scripts/entity-url";
import * as eventStream from "@rbx/core-scripts/event-stream";
import * as game from "@rbx/core-scripts/game";
import * as hybrid from "@rbx/core-scripts/hybrid";
import * as localStorageService from "@rbx/core-scripts/local-storage";
import * as localStorageKeys from "@rbx/core-scripts/local-storage/keys";
import * as metrics from "@rbx/core-scripts/metrics";
import * as paymentsFlow from "@rbx/core-scripts/payments-flow";
import * as chat from "@rbx/core-scripts/util/chat";
import * as defer from "@rbx/core-scripts/util/defer";
import * as elementVisibility from "@rbx/core-scripts/util/element-visibility";
import * as upsell from "@rbx/core-scripts/util/upsell";
import * as user from "@rbx/core-scripts/util/user";
import * as CoreUtilities from "@rbx/core-scripts/legacy/core-utilities";
import * as CoreRobloxUtilities from "@rbx/core-scripts/legacy/core-roblox-utilities";

import heartbeatInit from "./src/pageHeartbeat";

// Side-effect only import (singleton interceptor that applies bound auth tokens to all jQuery
// requests). The React (and general purpose) version of this interceptor is attached to the
// exported `httpService` and the Angular version of this interceptor lives with the
// `angularJsUtilities` bundle.
import "./src/boundAuthTokenHeaderInjector";

$.ajaxPrefilter(endpoints.ajaxPrefilter);

const addLocalePrefixToAnchorTag = (a: HTMLAnchorElement): void => {
  // Only match same site links
  if (a.hostname === window.location.hostname) {
    const oldHref = a.href;
    const newHref = endpoints.attachUrlLocale(oldHref);
    if (newHref !== oldHref) {
      // eslint-disable-next-line no-param-reassign
      a.href = newHref;
    }
  }
};

const localizeAllLinks = () => {
  const allLinks = document.links;
  for (const a of allLinks) {
    if (a instanceof HTMLAnchorElement) {
      addLocalePrefixToAnchorTag(a);
    }
  }
};

const rewriteDynamicLinksOnClick = () => {
  // Don't turn into arrow function, it changes the behavior of 'this'
  $("body").on("click", "a", function onClick() {
    // @ts-expect-error `this` is assumed to be an `HTMLAnchorElement`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    addLocalePrefixToAnchorTag(this);
  });
};

if (endpoints.supportLocalizedUrls) {
  $(document).ready(() => {
    localizeAllLinks();
    rewriteDynamicLinksOnClick();
  });
}

addExternal(["Roblox", "core-scripts", "endpoints"], endpoints);
addExternal(["Roblox", "core-scripts", "format", "number"], fmtNumber);
addExternal(["Roblox", "core-scripts", "format", "string"], fmtString);
addExternal(["Roblox", "core-scripts", "http", "http"], http);
addExternal(["Roblox", "core-scripts", "http", "util"], httpUtil);
addExternal(["Roblox", "core-scripts", "util", "accessibility"], accessibility);
addExternal(["Roblox", "core-scripts", "util", "batchRequest"], batchRequest);
addExternal(["Roblox", "core-scripts", "util", "currentBrowser"], currentBrowser);
addExternal(["Roblox", "core-scripts", "util", "cursorPagination"], cursorPagination);
addExternal(["Roblox", "core-scripts", "util", "date"], date);
addExternal(["Roblox", "core-scripts", "util", "defer"], defer);
addExternal(["Roblox", "core-scripts", "util", "pageName"], pageName);
addExternal(["Roblox", "core-scripts", "util", "ready"], ready);
addExternal(["Roblox", "core-scripts", "util", "url"], url);

addExternal("CoreUtilities", { ...CoreUtilities });
addLegacyExternal(["Roblox", "Endpoints"], endpoints);

addExternal(["Roblox", "core-scripts", "auth", "boundAuth"], boundAuth);
addExternal(["Roblox", "core-scripts", "auth", "crypto"], crypto);
addExternal(["Roblox", "core-scripts", "auth", "fido2"], fido2);
addExternal(["Roblox", "core-scripts", "auth", "hba"], hba);
addExternal(["Roblox", "core-scripts", "auth", "hybridResponse"], hybridResponse);
addExternal(["Roblox", "core-scripts", "auth", "sai"], sai);
addExternal(["Roblox", "core-scripts", "dataStore"], dataStore);
addExternal(["Roblox", "core-scripts", "deepLink"], deepLink);
addExternal(["Roblox", "core-scripts", "entityUrl"], entityUrl);
addExternal(["Roblox", "core-scripts", "eventStream"], eventStream);
addExternal(["Roblox", "core-scripts", "game"], game);
addExternal(["Roblox", "core-scripts", "hybrid"], hybrid);
addExternal(["Roblox", "core-scripts", "localStorage", "localStorage"], localStorageService);
addExternal(["Roblox", "core-scripts", "localStorage", "keys"], localStorageKeys);
addExternal(["Roblox", "core-scripts", "metrics"], metrics);
addExternal(["Roblox", "core-scripts", "paymentsFlow"], paymentsFlow);
addExternal(["Roblox", "core-scripts", "util", "chat"], chat);
addExternal(["Roblox", "core-scripts", "util", "elementVisibility"], elementVisibility);
addExternal(["Roblox", "core-scripts", "util", "upsell"], upsell);
// eslint-disable-next-line @typescript-eslint/no-deprecated
addExternal(["Roblox", "core-scripts", "util", "user"], user);

addExternal("CoreRobloxUtilities", { ...CoreRobloxUtilities });

addLegacyExternal(["Roblox", "DeepLinkService"], {
  parseDeeplink: deepLink.parseDeepLink,
  navigateToDeepLink: deepLink.navigateToDeepLink,
});
addLegacyExternal(["Roblox", "ShareLinks"], deepLink.ShareLinks);
addLegacyExternal(["Roblox", "ShareLinksType"], deepLink.ShareLinksType);

heartbeatInit().catch(() => {
  // do nothing for now
});

try {
  CoreRobloxUtilities.initializeGenericChallengeInterceptor();
} catch {
  // do nothing for now
}
