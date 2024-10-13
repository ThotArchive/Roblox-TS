import { authenticatedUser } from '@rbx/header-scripts';
import dataStores from '../../../core/dataStoreManagement/stores/dataStores';
import angularJsUtilitiesModule from '../angularJsUtilitiesModule';
import { FriendsUserSortType } from '../../../core/dataStoreManagement/stores/userData/userDataConstants';

function usersPresenceService($q) {
  'ngInject';

  const { userDataStore } = dataStores;
  const defaultExpirationMS = 30000; // 30s

  const getFriendsPresence = forceUpdate => {
    const cacheCriteria = {
      refreshCache: forceUpdate,
      expirationWindowMS: defaultExpirationMS,
      useCache: !forceUpdate
    };
    const params = {
      userId: authenticatedUser?.id,
      userSort: FriendsUserSortType.StatusFrequents,
      isGuest: false
    };
    return $q((resolve, reject) => {
      userDataStore
        .getFriends(params, cacheCriteria)
        .then(result => {
          resolve(result?.userData);
        })
        .catch(reject);
    });
  };
  return {
    getFriendsPresence
  };
}

angularJsUtilitiesModule.factory('usersPresenceService', usersPresenceService);

export default usersPresenceService;
