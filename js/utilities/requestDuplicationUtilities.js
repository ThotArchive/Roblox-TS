const getMetaData = () => {
  const metaTag = document.querySelector('meta[name="request-duplication-meta-data"]');
  const parsedDuplicationRatio = parseFloat(metaTag?.dataset?.duplicationRatio);
  const duplicationRatio = Number.isNaN(parsedDuplicationRatio) ? 0 : parsedDuplicationRatio;

  return {
    duplicationEnabled: metaTag?.dataset?.duplicationEnabled === 'true',
    apiSitesAllowList: metaTag?.dataset?.apiSitesAllowList ?? '',
    duplicationRatio
  };
};

const metaData = getMetaData();

const isHostnameValid = url => {
  const hostnames = {
    prod: 'roblox.com',
    dev: 'robloxlabs.com'
  };
  const testUrl = url || window.location?.hostname;
  return testUrl.indexOf(hostnames.prod) > -1 || testUrl.indexOf(hostnames.dev) > -1;
};

const listOfAvailableApiSites = metaData.apiSitesAllowList.split(',');

const isApiSiteAvailable = url => {
  // make sure the current site and testing url are coming from roblox domain
  if (!isHostnameValid() || !isHostnameValid(url)) {
    return false;
  }

  if (listOfAvailableApiSites.length > 0) {
    return listOfAvailableApiSites.some(apiSite => {
      return apiSite.length > 0 && url.includes(apiSite);
    });
  }

  return false;
};

// Determines whether the request should be duplicated
const shouldDuplicate = (url, isDuplicate) => {
  return (
    metaData.duplicationEnabled && // duplication is enabled
    !isDuplicate && // isn't already a duplicate request
    isApiSiteAvailable(url) // URL is on the allow list
  );
};

// Computes how many times the current request should be duplicated
// e.g. if duplicationRatio is 1.5, half the time the request should
// be duplicated once, half the time it should be duplicated twice.
const getDuplicationCount = () => {
  const ratio = metaData.duplicationRatio;
  if (ratio <= 0) {
    return 0;
  }

  const wholePart = Math.floor(ratio);
  const fractionalPart = ratio - wholePart;

  let duplicationCount = wholePart;
  if (fractionalPart > 0) {
    const random = Math.random();
    if (random < fractionalPart) {
      duplicationCount += 1;
    }
  }

  return duplicationCount;
};

export default {
  shouldDuplicate,
  getDuplicationCount
};
