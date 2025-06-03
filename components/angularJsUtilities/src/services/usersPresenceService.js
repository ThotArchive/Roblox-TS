import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import dataStores from "@rbx/core-scripts/data-store";
import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function usersPresenceService($q) {
  "ngInject";

  const { userDataStore } = dataStores;
  const defaultExpirationMS = 30000; // 30s

  const getFriendsPresence = forceUpdate => {
    const cacheCriteria = {
      refreshCache: forceUpdate,
      expirationWindowMS: defaultExpirationMS,
      useCache: !forceUpdate,
    };
    const params = {
      userId: authenticatedUser()?.id,
      userSort: dataStores.userDataStore.FriendsUserSortType.StatusFrequents,
      isGuest: false,
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
    getFriendsPresence,
  };
}

angularJsUtilitiesModule.factory("usersPresenceService", usersPresenceService);

export default usersPresenceService;
