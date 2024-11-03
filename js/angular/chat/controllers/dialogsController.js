import angular from 'angular';
import chatModule from '../chatModule';

function dialogsController($scope, chatService, chatUtility, messageService, $log) {
  'ngInject';

  $scope.isNewGroupChat = function(conversation) {
    return (
      conversation.dialogType === chatUtility.dialogType.NEWGROUPCHAT ||
      (conversation.addMoreFriends && !conversation.isGroupChat)
    );
  };

  $scope.canAddFriendInExistedConversation = function(conversation) {
    return conversation.addMoreFriends && conversation.isGroupChat;
  };

  $scope.resetPreviousDialog = function(oldLayoutId, newLayoutId, preDialogData) {
    $scope.chatUserDict[oldLayoutId].selectedUserIds = [];
    $scope.chatUserDict[oldLayoutId].selectedUsersDict = {};
    if (!preDialogData.preserved) {
      delete $scope.chatUserDict[oldLayoutId];
    } else {
      $scope.chatUserDict[oldLayoutId].addMoreFriends = false;
    }

    // update dialogList for position and dialog status
    const position = $scope.chatLibrary.dialogIdList.indexOf(oldLayoutId);
    if (position > -1 && !preDialogData.preserved) {
      // legacy dialog existed but no need to keep, such as new group creation
      $scope.destroyDialogLayout(oldLayoutId);
      delete $scope.chatLibrary.dialogDict[oldLayoutId];
      if (preDialogData.isDuplicatedConversation) {
        $scope.chatLibrary.dialogIdList.splice(position);
      } else {
        $scope.chatLibrary.dialogIdList[position] = newLayoutId;
        $scope.chatLibrary.dialogDict[newLayoutId] = { ...chatUtility.dialogInitValue };
      }
    } else {
      $scope.updateDialogList(newLayoutId, true);
    }
  };
  $scope.generateDialog = function(conversation, dialogType, preDialogData) {
    const oldLayoutId = preDialogData.layoutId;
    const newLayoutId = $scope.getLayoutId(conversation.id, dialogType);
    conversation.dialogType = dialogType;
    if (oldLayoutId !== newLayoutId) {
      // update user data and friends library
      $scope.getUserInfoForConversation(conversation);

      // fill the new conversation and update chatUserDict
      conversation.layoutId = newLayoutId;
      $scope.updateChatViewModel(conversation, true);

      // reset previous dialog and update dialogList for position and dialog status
      $scope.resetPreviousDialog(oldLayoutId, newLayoutId, preDialogData);
    } else {
      // update user data and friends library
      $scope.getUserInfoForConversation(conversation);
      $scope.updateChatViewModel(conversation, true);
      $scope.chatLibrary.dialogDict[oldLayoutId].isUpdated = true;
      $scope.chatLibrary.dialogDict[oldLayoutId].updateStatus = chatUtility.dialogStatus.REFRESH;
    }
  };

  $scope.createNewGroupChat = function(layoutId, currentConversation) {
    if ($scope.newGroupChatLocked) {
      return;
    }
    $scope.newGroupChatLocked = true;

    const preDialogData = { layoutId };
    let newTitle = currentConversation.name;
    if (currentConversation.addMoreFriends && !currentConversation.isGroupChat) {
      const participantUsers = currentConversation.participants;
      angular.forEach(participantUsers, function(user) {
        const userId = user.id;
        if (userId !== $scope.chatLibrary.userId) {
          if (
            currentConversation.selectedUserIds &&
            currentConversation.selectedUserIds.indexOf(userId) < 0
          ) {
            currentConversation.selectedUserIds.push(userId);
          }
          currentConversation.selectedUsersDict[userId] = angular.copy(
            $scope.chatLibrary.friendsDict[userId]
          );
          currentConversation.selectedUsersDict[userId].hiddenFromSelection = true;
        }
      });
      preDialogData.preserved = true;
      newTitle = '';
    }
    chatService
      .startGroupConversation(currentConversation.selectedUserIds, newTitle)
      .then(function(conversation) {
        if (conversation.status === chatUtility.resultType.SUCCESS) {
          const layoutId = $scope.chatLibrary.allConversationLayoutIdsDict[conversation.id];
          if (layoutId) {
            // duplicate group conversation
            preDialogData.isDuplicatedConversation = true;
            $scope.resetPreviousDialog(currentConversation.layoutId, layoutId, preDialogData);
            if ($scope.chatLibrary.dialogIdList.indexOf(layoutId) < 0) {
              $scope.launchDialog(layoutId, true);
            }
          } else {
            conversation.isGroupChat =
              conversation.type === chatUtility.conversationType.multiUserConversation;
            messageService.formatTimestampInConversation(conversation);
            $scope.generateDialog(conversation, chatUtility.dialogType.GROUPCHAT, preDialogData);
          }
        }
        $scope.newGroupChatLocked = false;
      })
      .catch(function(ex) {
        $scope.newGroupChatLocked = false;
      });
  };

  $scope.sendInvite = function(layoutId) {
    $log.debug('------------- sendInvite ------------');
    const currentConversation = $scope.chatUserDict[layoutId];
    if (
      (currentConversation.dialogType === chatUtility.dialogType.CHAT ||
        currentConversation.dialogType === chatUtility.dialogType.GROUPCHAT) &&
      !currentConversation.addMoreFriends
    ) {
      const { userIds } = currentConversation;
      const myPosition = userIds.indexOf($scope.chatLibrary.userId);
      if (myPosition > -1) {
        userIds.splice(myPosition, 1);
      }
      currentConversation.selectedUserIds = userIds;
    } else if ($scope.canAddFriendInExistedConversation(currentConversation)) {
      chatService
        .addToConversation(currentConversation.selectedUserIds, currentConversation.id)
        .then(function(data) {
          if (data && data.status === chatUtility.resultType.SUCCESS) {
            currentConversation.addMoreFriends = false;
            currentConversation.selectedUserIds.forEach(selectedUserId => {
              if (currentConversation.userIds.indexOf(selectedUserId) < 0) {
                currentConversation.userIds.push(selectedUserId);
              }
            });
          }
        })
        .finally(() => {
          currentConversation.selectedUserIds = [];
          currentConversation.selectedUsersDict = {};
        });
    } else if ($scope.isNewGroupChat(currentConversation)) {
      $scope.createNewGroupChat(layoutId, currentConversation);
    }
  };
}

chatModule.controller('dialogsController', dialogsController);

export default dialogsController;
