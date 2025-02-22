import notificationStreamModule from '../notificationStreamModule';

function layoutLibraryService($log, languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    links: {
      profileLinkName: 'goToProfilePage',
      profileLink: '/users/{id}/profile',
      friendRequestLinkName: 'viewAllFriendRequests',
      friendRequestTabName: 'Friends',
      friendRequestLink: '/users/friends#!/friend-requests',
      settingLinkName: 'goToSettingPage',
      settingTabName: 'Settings',
      settingLink: '/my/account#!/notifications',
      friendsTabName: 'Friends',
      friendsLink: '/users/friends',
      inboxTabName: 'Messages',
      inboxLink: '/my/messages/#!/inbox',
      inboxMessageDetailQuery: '?conversationId=',
      groupLinkName: 'goToGroupPage',
      groupLink: '/communities/{id}',
      myGroupsLink: '/my/communities'
    },

    stringTemplates: {
      boldLink: "<a class='font-caption-header'>{username}</a>",
      userLink:
        "<a class='text-name small font-caption-header' type='goToProfilePage' user_id='{userid}' href='{profilelink}'>{username}</a>",
      boldDisplayNameLink: "<a class='font-caption-header'>{displayname}</a>",
      displayNameLink:
        "<span class='cursor-pointer text-name paired-name'><a class='element small text-emphasis' type='goToProfilePage' user_id='{userid}' href='{profilelink}'>{displayname}</a><span class='text-emphasis small connector'>@</span><span class='small element'>{username}</span></span>",
      groupLink:
        "<a class='text-name small font-caption-header' type='goToGroupPage' group_id='{groupid}' href='{grouplink}'>{groupname}</a>"
    },

    newFriendRequests(numberOfRequests) {
      return lang.get('Message.YouHaveNewFriendRequests', { numberOfRequests });
    },

    newFriends(numberOfFriends) {
      return lang.get('Message.YouHaveNewFriends', { numberOfFriends });
    },

    newGroups(numberOfGroups) {
      return lang.get('Message.YouHaveBeenAcceptedToNewGroups', { numberOfGroups });
    },

    friendRequestAcceptedSingle(userOne) {
      return lang.get('Message.FriendRequestAcceptedSingle', { userOne });
    },

    friendRequestAcceptedDouble(userOne, userTwo) {
      return lang.get('Message.FriendRequestAcceptedDouble', {
        userOne,
        userTwo
      });
    },

    friendRequestAcceptedMultiple(userOne, userTwo, userMultipleCount) {
      return lang.get('Message.FriendRequestAcceptedMultiple', {
        userOne,
        userTwo,
        userMultipleCount
      });
    },

    groupJoinRequestAcceptedSingle(groupOne) {
      return lang.get('Message.GroupJoinRequestAcceptedSingle', { groupOne });
    },

    groupJoinRequestAcceptedDouble(groupOne, groupTwo) {
      return lang.get('Message.GroupJoinRequestAcceptedDouble', {
        groupOne,
        groupTwo
      });
    },

    groupJoinRequestAcceptedMultiple(groupOne, groupTwo, groupMultipleCount) {
      return lang.get('Message.GroupJoinRequestAcceptedMultiple', {
        groupOne,
        groupTwo,
        groupMultipleCount
      });
    },

    friendRequestSentSingle(userOne) {
      return lang.get('Message.FriendRequestSentSingle', { userOne });
    },

    friendRequestSentDouble(userOne, userTwo) {
      return lang.get('Message.FriendRequestSentDouble', { userOne, userTwo });
    },

    friendRequestSentMultiple(userOne, userTwo, userMultipleCount) {
      return lang.get('Message.FriendRequestSentMultiple', {
        userOne,
        userTwo,
        userMultipleCount
      });
    },

    confirmAcceptedSingle(userOne) {
      return lang.get('Message.ConfirmAcceptedSingle', { userOne });
    },

    confirmAcceptedDouble(userOne, userTwo) {
      return lang.get('Message.ConfirmAcceptedDouble', { userOne, userTwo });
    },

    confirmAcceptedMultiple(userOne, userTwo, userMultipleCount) {
      return lang.get('Message.ConfirmAcceptedMultiple', {
        userOne,
        userTwo,
        userMultipleCount
      });
    },

    confirmSentSingle(userOne) {
      return lang.get('Message.ConfirmSentSingle', { userOne });
    },

    confirmSentDouble(userOne, userTwo) {
      return lang.get('Message.ConfirmSentDouble', { userOne, userTwo });
    },

    confirmSentMultiple(userOne, userTwo, userMultipleCount) {
      return lang.get('Message.ConfirmSentMultiple', {
        userOne,
        userTwo,
        userMultipleCount
      });
    },

    textTemplate: {
      newNotification(numberOfNotifications) {
        return lang.get('Message.NumberofNewNotifications', {
          notificationCount: numberOfNotifications
        });
      },

      noNetworkConnectionText() {
        return lang.get('Label.NoNetworkConnectionText');
      }
    },

    friendRequestActionType: {
      acceptIgnoreBtns: 'AcceptIgnoreBtns',
      chatBtn: 'chatBtn',
      viewAllBtn: 'ViewAllBtn'
    },

    directiveTemplatesName: {
      notificationIndicatorTemplate: 'notification-indicator',
      notificationStreamIndicatorTemplate: 'notification-stream-indicator',
      notificationContentTemplate: 'notification-content',
      friendRequestReceivedTemplate: 'friend-request-received',
      friendRequestAcceptedTemplate: 'friend-request-accepted',
      friendRequestTemplate: 'friend-request',
      privateMessageTemplate: 'private-message',
      developerMetricsAvailableTemplate: 'developer-metrics-available',
      testTemplate: 'test',
      newGameUpdateTemplate: 'new-game-update-template',
      notificationStreamBaseTemplate: 'notification-stream-base',
      notificationStreamIconTemplate: 'notification-stream-icon',
      notificationContentViewTemplate: 'notification-content-view-template',
      gameUpdateTemplate: 'game-update-template',
      gameUpdateActionPopoverTemplate: 'game-update-action-popover-template',
      groupMembershipTemplate: 'group-membership',
      notificationStreamBaseViewTemplate: 'notification-stream-base-view',
      notificationStreamContainerTemplate: 'notification-stream-container'
    },

    notificationSourceType: {
      test: 'Test',
      friendRequestReceived: 'FriendRequestReceived',
      friendRequestAccepted: 'FriendRequestAccepted',
      privateMessageReceived: 'PrivateMessageReceived',
      developerMetricsAvailable: 'DeveloperMetricsAvailable',
      gameUpdate: 'GameUpdate',
      groupJoinRequestAccepted: 'GroupJoinRequestAccepted',
      sendr: 'Sendr',
      sendrBundle: 'SendrBundle'
    },

    gameUpdates: {
      formatDisplayTextDouble(game1, game2) {
        return lang.get('Message.AggregatedGameUpdateDouble', {
          gameOne: `<span class='font-caption-header'>${game1}</span>`,
          gameTwo: `<span class='font-caption-header'>${game2}</span>`
        });
      },

      formatDisplayTextMultiple(game1, game2, otherCount) {
        return lang.get('Message.AggregatedGameUpdateMultiple', {
          gameOne: `<span class='font-caption-header'>${game1}</span>`,
          gameTwo: `<span class='font-caption-header'>${game2}</span>`,
          otherCount
        });
      }
    }
  };
}

notificationStreamModule.factory('layoutLibraryService', layoutLibraryService);

export default layoutLibraryService;
