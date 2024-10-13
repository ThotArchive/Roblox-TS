import { Endpoints, EnvironmentUrls } from 'Roblox';

const { getAbsoluteUrl } = Endpoints;
const { universalAppConfigurationApi } = EnvironmentUrls;

const privacyPolicyUrl = getAbsoluteUrl('/info/privacy');
const getCookiePolicyConfig = {
  withCredentials: true,
  url: `${universalAppConfigurationApi}/v1/behaviors/cookie-policy/content`
};
const supportUrl = getAbsoluteUrl('/support');
const googleAnalyticsWebsite = 'https://marketingplatform.google.com/about/analytics/';
const googleAnalyticsReadMore =
  'https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage';

export default {
  privacyPolicyUrl,
  getCookiePolicyConfig,
  googleAnalyticsWebsite,
  supportUrl,
  googleAnalyticsReadMore
};
