const getMetaData = () => {
  const duplicationMeta = document.querySelector<HTMLElement>(
    'meta[name="request-duplication-meta-data"]',
  );
  const parsedDuplicationRatio =
    duplicationMeta?.dataset.duplicationRatio != null
      ? parseFloat(duplicationMeta.dataset.duplicationRatio)
      : null;
  const duplicationRatio = Number.isNaN(parsedDuplicationRatio) ? 0 : parsedDuplicationRatio;
  const retryMeta = document.querySelector<HTMLElement>('meta[name="page-retry-header-enabled"]');

  return {
    duplicationEnabled: duplicationMeta?.dataset.duplicationEnabled === "true",
    apiSitesAllowList:
      duplicationMeta?.dataset.apiSitesAllowList != null
        ? duplicationMeta.dataset.apiSitesAllowList
        : "",
    duplicationRatio,
    retryAttemptHeaderEnabled: retryMeta?.dataset.retryAttemptHeaderEnabled === "True",
  };
};

const metaData = getMetaData();

const isHostnameValid = (url?: string) => {
  const testUrl = url ?? window.location.hostname;
  return testUrl.includes("roblox.com") || testUrl.includes("robloxlabs.com");
};

const listOfAvailableApiSites = metaData.apiSitesAllowList.split(",");

const isApiSiteAvailable = (url: string) => {
  // make sure the current site and testing url are coming from roblox domain
  if (!isHostnameValid() || !isHostnameValid(url)) {
    return false;
  }

  if (listOfAvailableApiSites.length > 0) {
    return listOfAvailableApiSites.some(apiSite => apiSite.length > 0 && url.includes(apiSite));
  }

  return false;
};

// Determines whether the request should be duplicated
export const shouldDuplicate = (url: string, isDuplicate?: boolean): boolean =>
  metaData.duplicationEnabled && // duplication is enabled
  !isDuplicate && // isn't already a duplicate request
  isApiSiteAvailable(url); // URL is on the allow list

// Computes how many times the current request should be duplicated
// e.g. if duplicationRatio is 1.5, half the time the request should
// be duplicated once, half the time it should be duplicated twice.
export const duplicationCount = (): number => {
  const ratio = metaData.duplicationRatio;
  if (ratio == null || ratio <= 0) {
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

export const retryAttemptHeader = (): boolean => metaData.retryAttemptHeaderEnabled;
