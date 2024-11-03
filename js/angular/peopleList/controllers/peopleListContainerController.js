import angular from 'angular';
import { CurrentUser } from 'Roblox';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import { UserProfileField } from 'roblox-user-profiles';
import peopleListModule from '../peopleListModule';
import { getUrlUserId } from '../../../utils/appUtil';

function peopleListContainerController(
  $scope,
  $log,
  friendsService,
  utilityService,
  layoutService,
  gamesService,
  resources,
  usersPresenceService,
  userProfilesService
) {
  'ngInject';

  function isAuthenticatedUsersFriends() {
    const userId = getUrlUserId();

    if (userId === null && CurrentUser) {
      return true;
    }
    return userId === CurrentUser.userId;
  }

  function initializeVerifiedBadges() {
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-friends-carousel'
      });
    } catch (e) {
      // noop
    }
  }

  $scope.setPlaceDetails = function (placeIds) {
    gamesService.multiGetPlaceDetails(placeIds).then(function success(result) {
      angular.forEach(result, function (placeDetail, placeId) {
        if (placeDetail) {
          $scope.library.placesDict[placeId] = placeDetail;

          switch (placeDetail.reasonProhibited) {
            case resources.reasonProhibitedMessage.None:
              $scope.library.placesDict[placeId].buttonLayout = angular.copy(
                layoutService.playButtons.join
              );
              break;
            case resources.reasonProhibitedMessage.PurchaseRequired:
              $scope.library.placesDict[placeId].requiredPurchase = true;
            default:
              $scope.library.placesDict[placeId].buttonLayout = angular.copy(
                layoutService.playButtons.details
              );
              break;
          }
        }
      });
    });
  };

  $scope.safelyUpdatePresenceData = function (userId, presence) {
    if (!userId) {
      $scope.layout.invalidPresenceData = true;
      return;
    }

    // presence information is absent or invalid.
    // set some default values to avoid errors.
    if (presence && !presence.userId) {
      presence = {
        lastLocation: 'Website',
        userId,
        userPresenceType: 0
      };
      $scope.layout.invalidPresenceData = true;
    }

    if (presence) {
      $scope.updatePresenceData(presence);
    }
  };

  $scope.updatePresenceData = function (presence) {
    const { presenceTypes } = layoutService;

    switch (presence.userPresenceType) {
      case presenceTypes.online.status:
        presence.className = layoutService.presenceTypes.online.className;
        break;
      case presenceTypes.ingame.status:
        presence.className = layoutService.presenceTypes.ingame.className;
        if (presence.rootPlaceId) {
          presence.placeUrl = layoutService.getGameDetailsPageUrl(presence.rootPlaceId);
        }
        break;
      case presenceTypes.instudio.status:
        presence.className = layoutService.presenceTypes.instudio.className;
        if (presence.rootPlaceId) {
          presence.placeUrl = layoutService.getGameDetailsPageUrl(presence.rootPlaceId);
        }
        break;
    }

    if (!$scope.library.friendsDict[presence.userId]) {
      $scope.library.friendsDict[presence.userId] = {};
    }

    $scope.library.friendsDict[presence.userId].presence = presence;
  };

  $scope.buildFriendsInfo = function (friendUserIds, options) {
    if (options.shouldGetPresenceData) {
      friendsService.getPresences(friendUserIds).then(function success(result) {
        const placeIdsNotInPlacesDict = [];
        angular.forEach(result, function (presence, i) {
          const potentialPlaceId = presence.rootPlaceId;
          if (potentialPlaceId && !$scope.library.placesDict[potentialPlaceId]) {
            placeIdsNotInPlacesDict.push(potentialPlaceId);
          }
          $scope.safelyUpdatePresenceData(friendUserIds[i], presence);
        });
        if (placeIdsNotInPlacesDict.length > 0) {
          $scope.setPlaceDetails(placeIdsNotInPlacesDict);
        }
        $scope.layout.isAllFriendsDataLoaded = true;
        initializeVerifiedBadges();
      });
    } else {
      if (!$scope.library.isForCurrentUsersFriends) {
        friendUserIds.sort((aId, bId) => {
          const a = $scope.library.friendsDict[aId];
          const b = $scope.library.friendsDict[bId];
          return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });
      }
      $scope.library.friendIds = friendUserIds;

      $scope.layout.isAllFriendsDataLoaded = true;
      initializeVerifiedBadges();
    }
  };

  $scope.buildFriendsList = function (userId) {
    $scope.layout.namesLoading = true;
    friendsService.getFriendsList(userId).then(
      function success(result) {
        const friends = result.data || result;
        const friendUserIds = [];
        angular.forEach(friends, function (friend) {
          const friendUserId = friend.id;
          if (friendUserIds.indexOf(friendUserId) < 0) {
            // check if user id existed
            friendUserIds.push(friendUserId);
          }
          friend.profileUrl = layoutService.getProfilePageUrl(friendUserId);
          friend.hasVerifiedBadge = friend.hasVerifiedBadge;
          $scope.library.friendsDict[friendUserId] = friend;
        });

        const userProfileFields = [UserProfileField.Names.CombinedName];
        userProfilesService
          .watchUserProfiles(friendUserIds, userProfileFields)
          .subscribe(({ loading, error, data }) => {
            $scope.layout.namesLoading = loading;
            $scope.error = error;
            angular.forEach(friends, friend => {
              const currentFriend = friend;
              currentFriend.nameToDisplay = data[currentFriend.id].names.combinedName;
            });
          });

        $scope.buildFriendsInfo(friendUserIds, {
          shouldGetPresenceData: $scope.library.isForCurrentUsersFriends
        });
        $scope.library.numOfFriends = friends.length;
      },
      error => {
        $scope.layout.friendsError = true;
        $scope.layout.isAllFriendsDataLoaded = true;
      }
    );
  };

  $scope.setup = function () {
    $scope.library = {
      friendsDict: {},
      friendIds: [],
      isForCurrentUsersFriends: isAuthenticatedUsersFriends(),
      placesDict: {},
      numOfFriends: null
    };
    $scope.layout = layoutService;
  };

  $scope.buildFriendsListFromSharedService = friends => {
    $scope.layout.invalidPresenceData = false;
    $scope.layout.namesLoading = true;
    $scope.$evalAsync(() => {
      if (friends?.length) {
        const userIds = [];
        const placeIdsNotInPlacesDict = [];
        let numOfFriends = 0;
        angular.forEach(friends, friend => {
          const currentFriend = friend;
          const { id: userId } = currentFriend;
          $scope.library.friendsDict[userId] = friend;
          userIds.push(userId);

          // collect placeId for get place details later
          const potentialPlaceId = friend.presence.rootPlaceId;
          if (potentialPlaceId && !$scope.library.placesDict[potentialPlaceId]) {
            placeIdsNotInPlacesDict.push(potentialPlaceId);
          }
          $scope.safelyUpdatePresenceData(friend.id, friend.presence);
          numOfFriends += 1;
        });

        $scope.library.numOfFriends = numOfFriends;
        $scope.library.friendIds = userIds;

        const userProfileFields = [UserProfileField.Names.CombinedName];
        userProfilesService
          .watchUserProfiles(userIds, userProfileFields)
          .subscribe(({ loading, error, data }) => {
            $scope.layout.namesLoading = loading;
            $scope.error = error;
            angular.forEach(friends, friend => {
              const currentFriend = friend;
              currentFriend.nameToDisplay = data[currentFriend.id].names.combinedName;
            });
          });

        if (placeIdsNotInPlacesDict.length > 0) {
          $scope.setPlaceDetails(placeIdsNotInPlacesDict);
        }
      }

      $scope.layout.isAllFriendsDataLoaded = true;
      initializeVerifiedBadges();
    });
  };

  $scope.init = function () {
    $scope.setup();
    const userId = getUrlUserId() ?? CurrentUser.userId;

    if (isAuthenticatedUsersFriends()) {
      usersPresenceService.getFriendsPresence().then(
        result => {
          $scope.buildFriendsListFromSharedService(result);
        },
        error => {
          console.debug(error);
          $scope.layout.friendsError = true;
          $scope.layout.isAllFriendsDataLoaded = true;
        }
      );
    } else {
      $scope.buildFriendsList(userId);
    }
  };
  $scope.init();
}

peopleListModule.controller('peopleListContainerController', peopleListContainerController);

export default peopleListContainerController;
