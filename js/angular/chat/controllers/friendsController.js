import { DisplayNames } from 'Roblox';
import { UserProfileField } from 'roblox-user-profiles';
import angular from 'angular';
import chatModule from '../chatModule';

function friendsController(
  $scope,
  chatUtility,
  usersService,
  usersPresenceService,
  userProfilesService,
  friendsService,
  guacService,
  presenceLayout,
  $timeout
) {
  'ngInject';

  $scope.dialogLayout.scrollToBottom = false;
  $scope.dialogLayout.IsdialogContainerVisible = false;
  $scope.dialogParams = { ...chatUtility.dialogParams };
  $scope.dialogType = { ...chatUtility.dialogType };
  $scope.userPresenceTypes = { ...chatUtility.userPresenceTypes };
  $scope.friendsScrollbarElm = chatUtility.getScrollBarSelector(
    $scope.dialogData,
    chatUtility.scrollBarType.FRIENDSELECTION
  );
  $scope.dialogData.scrollBarType = chatUtility.scrollBarType.FRIENDSELECTION;

  $scope.dialogData.isCreated = true;

  $scope.updateFriendsDictData = friends => {
    if (friends?.length) {
      const userIds = [];
      const allUserIds = [];
      angular.forEach(friends, friend => {
        const currentFriend = friend;
        const { id: userId } = currentFriend;
        currentFriend.id = parseInt(userId, 10);
        if (!$scope.chatLibrary.usePaginatedFriends) {
          const { name, display_name } = currentFriend;
          currentFriend.nameForDisplay = DisplayNames?.Enabled() ? display_name : name;
        }

        if (!$scope.chatLibrary.friendsDict[userId]) {
          if ($scope.chatLibrary.usePaginatedFriends) {
            $scope.chatLibrary.friendsDict[userId] = {
              id: currentFriend.id,
              presence: {
                userPresenceType: currentFriend.userPresence
                  ? presenceLayout.conversion[currentFriend.userPresence.UserPresenceType]
                  : 0
              }
            };
          } else {
            $scope.chatLibrary.friendsDict[userId] = currentFriend;
          }

          userIds.push(userId);
        }
        allUserIds.push(userId);
      });

      const userProfileFields = [UserProfileField.Names.CombinedName];

      userProfilesService
        .watchUserProfiles(allUserIds, userProfileFields)
        .subscribe(({ loading, error, data }) => {
          Object.keys(data).forEach(function (id) {
            if ($scope.chatLibrary.friendsDict[id]) {
              $scope.chatLibrary.friendsDict[id].nameForDisplay = data[id].names.combinedName;
            }
          });
        });

      $scope.updateFriends(friends);

      if (userIds && userIds.length > 0) {
        usersService.getAvatarHeadshots(userIds, $scope.chatLibrary.friendsDict);
      }
    }
  };

  const getFriends = function () {
    if ($scope.chatLibrary.usePaginatedFriends) {
      Promise.all([
        friendsService.getAllOnlineFriends($scope.chatLibrary.userId),
        friendsService.getPaginatedFriends($scope.chatLibrary.userId, '')
      ]).then(
        responses => {
          const combinedFriends = [...responses[0].data, ...responses[1].PageItems];
          if (combinedFriends.length > 0) {
            $scope.updateFriendsDictData(combinedFriends);
            $scope.chatLibrary.currentFriendCursor = responses[1].NextCursor;
          }
        },
        error => {
          console.debug(error);
        }
      );
    } else {
      usersPresenceService.getFriendsPresence().then(result => {
        if (result?.length) {
          $scope.updateFriendsDictData(result);
        }
      });
    }
  };

  if ($scope.chatLibrary.friendIds.length > 0) {
    $scope.updateFriends();
  }
  getFriends();
  $scope.isOverLoaded();
}

chatModule.controller('friendsController', friendsController);

export default friendsController;
