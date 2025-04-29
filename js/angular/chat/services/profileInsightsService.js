import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

function profileInsightsService($q, apiParamsInitialization, httpService) {
  'ngInject';

  const profileInsightsDomain =
    EnvironmentUrls.profileInsightsApi || `${EnvironmentUrls.apiGatewayUrl}/profile-insights-api`;

  return {
    getProfileInsights(userId) {
      return httpService
        .httpPost(
          {
            url: `${profileInsightsDomain}/v1/multiProfileInsights`,
            retryable: true,
            withCredentials: true
          },
          {
            userIds: [userId],
            count: 2
          }
        )
        .then(response => {
          const userInsights = response?.userInsights ?? [];
          const insightForUserId = userInsights.find(insight => insight.targetUser === userId);
          return insightForUserId?.profileInsights ?? [];
        });
    }
  };
}

chatModule.factory('profileInsightsService', profileInsightsService);

export default profileInsightsService;
