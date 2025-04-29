const getMetaData = () => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="roblox-tracer-meta-data"]');
  if (metaTag == null) {
    return {
      accessToken: null,
      serviceName: "Web",
      tracerEnabled: false,
      apiSitesRequestAllowList: "",
      sampleRate: 0,
      isInstrumentPagePerformanceEnabled: false,
    };
  }
  const sampleRate =
    metaTag.dataset.sampleRate != null ? parseInt(metaTag.dataset.sampleRate, 10) : 0;
  return {
    accessToken: metaTag.dataset.accessToken,
    serviceName: metaTag.dataset.serviceName ?? "Web",
    tracerEnabled: metaTag.dataset.tracerEnabled === "true",
    apiSitesRequestAllowList: metaTag.dataset.apiSitesRequestAllowList ?? "",
    sampleRate: Number.isNaN(sampleRate) ? 0 : sampleRate,
    isInstrumentPagePerformanceEnabled:
      metaTag.dataset.isInstrumentPagePerformanceEnabled === "true",
  };
};

const getPageName = () =>
  document.querySelector<HTMLElement>('meta[name="page-meta"]')?.dataset.internalPageName ?? null;

const configs = {
  environments: {
    dev: "Development",
    prod: "Production",
  },
  metaData: getMetaData(),
  pageName: getPageName(),
  hostnames: {
    prod: "roblox.com",
    dev: "robloxlabs.com",
  },
};

export default configs;
