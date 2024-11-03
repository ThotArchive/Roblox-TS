import { EnvironmentUrls } from 'Roblox';

const apiGwUrl = EnvironmentUrls.apiGatewayUrl || 'https://apis.roblox.com';

export default {
  safetyEvent: {
    url: `${apiGwUrl}/abuse-reporting/v1/safety-event`,
    retryable: true,
    withCredentials: true
  }
};
