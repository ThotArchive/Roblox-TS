import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

function friendsService($q, httpService, $log) {
  'ngInject';

  return {
    getAllOnlineFriends(userId) {
      return httpService.httpGet({
        url: `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/online`,
        retryable: true,
        withCredentials: true
      });
    },
    getPaginatedFriends(userId, cursor) {
      const params = {
        cursor
      };
      return httpService.httpGet(
        {
          url: `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/find`,
          retryable: true,
          withCredentials: true
        },
        params
      );
    },
    searchFriends(userId, query) {
      const params = {
        query
      };
      return httpService.httpGet(
        {
          url: `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/search`,
          retryable: true,
          withCredentials: true
        },
        params
      );
    }
  };
}

chatModule.factory('friendsService', friendsService);

export default friendsService;
