import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

function guacService($q, httpService, $log) {
  'ngInject';

  return {
    getChatUiPolicies() {
      return httpService.httpGet({
        url: `${EnvironmentUrls.apiGatewayUrl}/universal-app-configuration/v1/behaviors/chat-ui/content`,
        retryable: true,
        withCredentials: true
      });
    },
    getAppPolicies() {
      return httpService.httpGet({
        url: `${EnvironmentUrls.apiGatewayUrl}/universal-app-configuration/v1/behaviors/app-policy/content`,
        retryable: true,
        withCredentials: true
      });
    },
  };
}

chatModule.factory('guacService', guacService);

export default guacService;
