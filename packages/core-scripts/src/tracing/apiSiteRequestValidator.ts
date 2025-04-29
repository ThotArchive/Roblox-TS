import configs from "./constants/configs";

const isHostnameValid = (url?: string) => {
  const { hostnames } = configs;
  const testUrl = url ?? window.location.hostname;
  return testUrl.includes(hostnames.prod) || testUrl.includes(hostnames.dev);
};

const listOfAvailableApiSites = configs.metaData.apiSitesRequestAllowList.split(",");
const isApiSiteAvailableForTracing = (url: string): boolean => {
  // make sure the current site and testing url are coming from roblox domain
  if (!isHostnameValid() || !isHostnameValid(url)) {
    return false;
  }

  if (listOfAvailableApiSites.length) {
    return listOfAvailableApiSites.some(apisite => url.includes(apisite));
  }

  return false;
};

export default {
  isApiSiteAvailableForTracing,
};
