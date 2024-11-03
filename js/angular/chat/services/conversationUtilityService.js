import { CurrentUser, DisplayNames } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function conversationsUtility($log, pinGameService, dialogAttributes) {
  'ngInject';

  const isUserAvatarInFriendsDict = function(userId, friendsDict) {
    return friendsDict[userId] && angular.isDefined(friendsDict[userId].avatarHeadshot);
  };

  const isUserPresenceInFriendsDict = function(userId, friendsDict) {
    return friendsDict[userId] && angular.isDefined(friendsDict[userId].userPresenceType);
  };

  const isUserInfoInFriendsDict = function(userId, friendsDict) {
    return (
      isUserAvatarInFriendsDict(userId, friendsDict) &&
      isUserPresenceInFriendsDict(userId, friendsDict)
    );
  };

  const buildPinGameInConversation = function(conversation) {
    if (conversation.conversationUniverse) {
      const parameters = {
        rootPlaceId: conversation.conversationUniverse.rootPlaceId,
        universeId: conversation.conversationUniverse.universeId,
        actorUsername: CurrentUser.name,
        userId: parseInt(CurrentUser.userId)
      };
      pinGameService.setPinGameData(conversation, parameters);
    }
    return conversation;
  };
  return {
    buildPinGameInConversation,

    getUserIdsNotInFriendsDict(conversations, friendsDict) {
      const userIds = [];
      if (conversations && conversations.length > 0) {
        const { conversationType, dialogTypes } = dialogAttributes;
        conversations.forEach(function(conversation) {
          conversation.isGroupChat =
            conversation.type === conversationType.multiUserConversation;
          angular.forEach(conversation.participants, function(user) {
            const userId = user.id;
            if (userIds.indexOf(userId) < 0 && !isUserInfoInFriendsDict(userId, friendsDict)) {
              userIds.push(userId);
            }

            if (!friendsDict[userId]) {
              const { name, display_name } = user;
              friendsDict[userId] = {
                id: userId,
                name,
                display_name,
                nameForDisplay: DisplayNames?.Enabled() ? display_name : name
              };
            }
          });
          if (!conversation.dialogType) {
            conversation.dialogType = conversation.isGroupChat
              ? dialogTypes.GROUPCHAT
              : dialogTypes.CHAT;
          }
          buildPinGameInConversation(conversation);
        });
      }
      return userIds;
    }
  };
}

chatModule.factory('conversationsUtility', conversationsUtility);

export default conversationsUtility;
