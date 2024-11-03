import { EnvironmentUrls } from 'Roblox';

const apiGwUrl = EnvironmentUrls.apiGatewayUrl || 'https://apis.roblox.com';
const { notificationApi, universalAppConfigurationApi, websiteUrl } = EnvironmentUrls;

export default {
  notificationActionUrl: (streamId: string, actionId: string): string =>
    `${notificationApi}/v2/stream-notifications/action/${streamId}/${actionId}`,

  reportAbuseUiConfigUrl: {
    withCredentials: true,
    url: `${universalAppConfigurationApi}/v1/behaviors/report-abuse-ui/content`,
    noCache: true
  },

  illegalContentReportingUrl: `${websiteUrl}/illegal-content-reporting`,

  reportNotificationUrl: {
    url: `${apiGwUrl}/notifications/v1/report-notification`,
    withCredentials: true,
    retryable: true
  }
};
