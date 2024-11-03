import notificationStreamModule from '../notificationStreamModule';

function friendRequest(notificationStreamUtility, $log, thumbnailConstants) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: {
      notification: '=',
      library: '=',
      layout: '=',
      appMeta: '=',
      acceptFriend: '&',
      ignoreFriend: '&',
      chat: '&',
      interactNotification: '&'
    },
    templateUrl: notificationStreamUtility.templates.friendRequestTemplate,
    link(scope, element, attrs) {
      const metaData = scope.notification.metadataCollection;
      const notificationType = scope.notification.notificationSourceType;
      const { length } = metaData;
      const count = scope.notification.eventCount ? scope.notification.eventCount : length;
      let userOne = '';
      let userTwo = '';

      const textFormat = function () {
        scope.userIds = [];
        scope.notificationDisplayText = '';
        metaData.forEach(function (data, index) {
          const user = notificationStreamUtility.normalizeUser(notificationType, data);
          const { userId } = user;
          const { userName } = user;
          const { displayName } = user;
          const profileLink =
            scope.library.userLibrary[userId] && scope.library.userLibrary[userId].profileLink
              ? scope.library.userLibrary[userId].profileLink
              : notificationStreamUtility.getAbsoluteUrl(
                  notificationStreamUtility.links.profileLink,
                  { id: userId }
                );
          if (scope.userIds.indexOf(userId) < 0) {
            scope.userIds.push(userId);
          }
          const htmlTemplate = notificationStreamUtility.getUserHtmlTemplate(
            notificationType,
            count
          );
          const html = notificationStreamUtility.getFormatString(htmlTemplate, {
            userId,
            userName,
            displayName,
            profileLink
          });
          if (index < 1) {
            userOne += html;
          } else if (index < 2) {
            userTwo += html;
          }
        });

        if (length === 0) {
          scope.notificationDisplayText = notificationStreamUtility.normalizeYouHaveText(
            notificationType,
            count
          );
        } else {
          // Multiple Users
          if (count > 2 || count > length) {
            const userMultipleCount = length > 2 ? count - 2 : count - length;
            scope.notificationDisplayText = notificationStreamUtility.normalizeMultipleDisplayText(
              notificationType,
              userOne,
              userTwo,
              userMultipleCount
            );
            scope.requestConfirmedText = notificationStreamUtility.normalizeMultipleConfirmedText(
              notificationType,
              userOne,
              userTwo,
              userMultipleCount
            );
            // Two Users
          } else if (count === 2) {
            scope.notificationDisplayText = notificationStreamUtility.normalizeDoubleDisplayText(
              notificationType,
              userOne,
              userTwo
            );
            scope.requestConfirmedText = notificationStreamUtility.normalizeDoubleConfirmedText(
              notificationType,
              userOne,
              userTwo
            );
            // One User
          } else {
            scope.notificationDisplayText = notificationStreamUtility.normalizeSingleDisplayText(
              notificationType,
              userOne
            );
            scope.requestConfirmedText = notificationStreamUtility.normalizeSingleConfirmedText(
              notificationType,
              userOne
            );
          }
        }
      };

      const actionTypeDistribution = function () {
        // check action Type based on event count and metadata
        scope.friendRequestActionType = notificationStreamUtility.friendRequestActionType;
        if (
          scope.notification.notificationSourceType ===
          notificationStreamUtility.notificationSourceType.friendRequestReceived
        ) {
          if (length === 1 && count === 1 && !metaData[0].IsAccepted) {
            scope.notification.friendRequestActionType = metaData[0].IsAccepted
              ? notificationStreamUtility.friendRequestActionType.chatBtn
              : notificationStreamUtility.friendRequestActionType.acceptIgnoreBtns;
          } else if (length === 1 && count === 1 && metaData[0].IsAccepted) {
            scope.notification.friendRequestActionType =
              notificationStreamUtility.friendRequestActionType.chatBtn;
          } else {
            scope.notification.friendRequestActionType =
              notificationStreamUtility.friendRequestActionType.viewAllBtn;
          }
        } else if (
          scope.notification.notificationSourceType ===
          notificationStreamUtility.notificationSourceType.friendRequestAccepted
        ) {
          if (length === 1 && count === 1) {
            scope.notification.friendRequestActionType =
              notificationStreamUtility.friendRequestActionType.chatBtn;
          }
        }
      };

      const init = function () {
        scope.notificationSourceType = notificationStreamUtility.notificationSourceType;
        scope.friendRequestLink = notificationStreamUtility.layout.friendRequestLink;
        scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;

        textFormat();
        actionTypeDistribution();
      };

      init();
    }
  };
}

notificationStreamModule.directive('friendRequest', friendRequest);

export default friendRequest;
