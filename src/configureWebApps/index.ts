import * as configuration from "./configuration";
import * as staticBundlesInfo from "./staticBundlesInfo";

const config = { ...configuration };
const bundleInfo = { ...staticBundlesInfo };

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ConfigureWebApps: typeof config;
    StaticBundlesInfo: typeof bundleInfo;
  }
}

window.ConfigureWebApps = config;
window.StaticBundlesInfo = bundleInfo;
