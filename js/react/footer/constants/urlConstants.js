import { EnvironmentUrls } from 'Roblox';

const { universalAppConfigurationApi } = EnvironmentUrls;

const getCookiePolicyConfig = {
  withCredentials: true,
  url: `${universalAppConfigurationApi}/v1/behaviors/cookie-policy/content`
};

export default { getCookiePolicyConfig };
