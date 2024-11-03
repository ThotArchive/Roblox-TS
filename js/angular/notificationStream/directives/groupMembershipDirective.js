import notificationStreamModule from '../notificationStreamModule';

function groupMembership(notificationStreamUtility, $log, thumbnailConstants, $filter) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: {
      notification: '=',
      appMeta: '=',
      library: '=',
      layout: '=',
      interactNotification: '&'
    },
    templateUrl: notificationStreamUtility.templates.groupMembershipTemplate,
    link(scope, element, attrs) {
      const metaData = scope.notification.metadataCollection;
      const notificationType = scope.notification.notificationSourceType;
      const { length } = metaData;
      const count = scope.notification.eventCount ? scope.notification.eventCount : length;
      let groupOne = '';
      let groupTwo = '';

      const textFormat = function () {
        scope.notificationDisplayText = '';
        metaData.forEach(function (group, index) {
          const { AccepterGroupId: groupId, AccepterGroupName: groupName } = group;
          const groupLink = notificationStreamUtility.getAbsoluteUrl(
            notificationStreamUtility.layout.groupLink,
            { id: groupId }
          );
          const htmlTemplate = notificationStreamUtility.getGroupHtmlTemplate();
          const html = notificationStreamUtility.getFormatString(htmlTemplate, {
            groupId,
            groupName: $filter('escapeHtml')(groupName),
            groupLink
          });
          if (index < 1) {
            groupOne += html;
            scope.groupMembershipLayout = {
              groupId,
              groupName,
              groupLink
            };
          } else if (index < 2) {
            groupTwo += html;
          }
        });

        if (length === 0) {
          scope.notificationDisplayText = notificationStreamUtility.normalizeYouHaveText(
            notificationType,
            count
          );
        } else {
          // Multiple groups
          if (count > 2 || count > length) {
            const groupMultipleCount = length > 2 ? count - 2 : count - length;
            scope.notificationDisplayText = notificationStreamUtility.normalizeMultipleDisplayText(
              notificationType,
              groupOne,
              groupTwo,
              groupMultipleCount
            );
            // Two groups
          } else if (count === 2) {
            scope.notificationDisplayText = notificationStreamUtility.normalizeDoubleDisplayText(
              notificationType,
              groupOne,
              groupTwo
            );
            // One group
          } else {
            scope.notificationDisplayText = notificationStreamUtility.normalizeSingleDisplayText(
              notificationType,
              groupOne
            );
          }
        }
      };

      const init = function () {
        scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;
        scope.groupMembershipLayout = {};

        textFormat();
      };

      init();
    }
  };
}

notificationStreamModule.directive('groupMembership', groupMembership);

export default groupMembership;
