import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

/*
Service wrapper for Roblox.Endpoints
It's probably worth it in the future to re-implement Roblox.Endpoints in angular as well
So we don't have to depend on the js file.
Roblox.Endpoints implementation is in JavascriptEndpoints.js
*/
function urlService() {
  "ngInject";

  var params; // holds prepared JSON object

  //js variables
  function getAbsoluteUrl(url) {
    const { Endpoints } = window.Roblox;
    if (Endpoints) {
      return Endpoints.getAbsoluteUrl(url);
    }
    return url;
  }

  // return JSON object from a QueryString or current URL
  function getJsonFromQueryString(url) {
    var result = {};

    // If url not passed, get querystring from current URL
    if (url === undefined) {
      url = window.location.search;
    }

    if (url && url.indexOf("?") > -1) {
      var query = url.substr(1);
      query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0].toLowerCase()] = item[1] ? decodeURIComponent(item[1]) : null;
      });
      params = result;
    }
    return result;
  }

  // get parameter from built json object
  function getParam(param) {
    if (!params) {
      getJsonFromQueryString();
    }
    param = param.toLowerCase();
    return params && params[param] ? params[param] : undefined;
  }

  function getGameDetailReferralUrls() {
    return {
      home: "/games/refer?SortName={sortName}&PlaceId={placeId}&Position={position}&PageType=Home&LocalTimestamp={localTimestamp}&TotalInSort={totalInSort}&SortPosition={sortPosition}&PageId={pageId}",
      groupDetail:
        "/games/refer?PlaceId={placeId}&PageType=GroupDetail&LocalTimestamp={localTimestamp}",
      chat: "/games/refer?SortName={sortName}&PlaceId={placeId}&PageType=Chat",
    };
  }

  return {
    getAbsoluteUrl: getAbsoluteUrl,
    getJsonFromQueryString: getJsonFromQueryString,
    getParam: getParam,
    getGameDetailReferralUrls: getGameDetailReferralUrls,
  };
}

angularJsUtilitiesModule.factory("urlService", urlService);

export default urlService;
