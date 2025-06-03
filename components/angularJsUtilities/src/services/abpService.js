import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function abpService() {
  //extend this list later when we need more.
  var adIds = {
    leaderboardAbp: "Leaderboard-Abp",
    skyscraperAdpRight: "Skyscraper-Abp-Right",
  };

  function registerAd(adId) {
    const { AdsHelper } = window.Roblox;
    if (AdsHelper && AdsHelper.AdRefresher) {
      AdsHelper.AdRefresher.registerAd(adId);
    }
  }

  function refreshAllAds() {
    const { AdsHelper } = window.Roblox;
    if (AdsHelper && AdsHelper.AdRefresher) {
      AdsHelper.AdRefresher.refreshAds();
    }
  }

  return {
    registerAd: registerAd,
    refreshAllAds: refreshAllAds,
    adIds: adIds,
  };
}

angularJsUtilitiesModule.factory("abpService", abpService);

export default abpService;
