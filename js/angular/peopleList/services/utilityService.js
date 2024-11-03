import peopleListModule from '../peopleListModule';

function utilityService($filter, layoutService, $log) {
  'ngInject';

  return {
    sortFriendsByOnlineOffline(library) {
      const orderBy = $filter('orderBy');
      let onlineFriends = [];
      let offlineFriends = [];

      angular.forEach(library.friendsDict, function (friend) {
        if (friend.presence && friend.presence.userPresenceType > 0) {
          onlineFriends.push(friend);
        } else {
          offlineFriends.push(friend);
        }
      });

      onlineFriends = orderBy(onlineFriends, '+name');
      offlineFriends = orderBy(offlineFriends, '+name');
      onlineFriends = onlineFriends.concat(offlineFriends);
      onlineFriends.forEach(function (friend) {
        library.friendIds.push(friend.id);
      });
    },

    // TODO: will be used for people list (B version)
    sortFriendsByPresenceType(library) {
      const orderBy = $filter('orderBy');
      let onlineFriends = [];
      let offlineFriends = [];
      let inGameFriends = [];
      let inStudioFriends = [];
      const presences = layoutService.presenceTypes;

      angular.forEach(library.friendsDict, function (friend) {
        if (!friend.presence) {
          return false;
        }
        switch (friend.presence.userPresenceType) {
          case presences.online.status:
            onlineFriends.push(friend);
            break;
          case presences.offline.status:
            offlineFriends.push(friend);
            break;
          case presences.ingame.status:
            inGameFriends.push(friend);
            break;
          case presences.instudio.status:
            inStudioFriends.push(friend);
            break;
        }
      });

      onlineFriends = orderBy(onlineFriends, '+name');
      offlineFriends = orderBy(offlineFriends, '+name');
      inGameFriends = orderBy(inGameFriends, '+name');
      inStudioFriends = orderBy(inStudioFriends, '+name');
      inGameFriends = inGameFriends.concat(onlineFriends);
      inGameFriends = inGameFriends.concat(inStudioFriends);
      inGameFriends = inGameFriends.concat(offlineFriends);
      inGameFriends.forEach(friend => {
        if (library.friendIds.indexOf(friend.id) < 0) {
          library.friendIds.push(friend.id);
        }
      });
    }
  };
}

peopleListModule.factory('utilityService', utilityService);

export default utilityService;
