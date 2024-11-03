import { DisplayNames } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

function privateMessage(notificationStreamUtility, $log, thumbnailConstants) {
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
    templateUrl: notificationStreamUtility.templates.privateMessageTemplate,
    link(scope, element, attrs) {
      const init = function () {
        scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;
        scope.notificationSourceType = notificationStreamUtility.notificationSourceType;
        scope.friendRequestLink = notificationStreamUtility.layout.friendRequestLink;
        scope.privateMessageLayout = {
          displayUserId: null,
          displayUserName: '',
          messagePreview: '',
          isStacked: false
        };
        const metaData = scope.notification.metadataCollection;
        const notificationType = scope.notification.notificationSourceType;
        if (scope.notification.eventCount > 1 || (metaData && metaData.length === 0)) {
          scope.privateMessageLayout.isStacked = true;
        }

        if (metaData && metaData.length > 0) {
          const user = notificationStreamUtility.normalizeUser(notificationType, metaData[0]);
          scope.privateMessageLayout.displayUserId = user.userId;
          scope.privateMessageLayout.displayUserName =
            DisplayNames && DisplayNames.Enabled() ? user.displayName : user.userName;
          scope.privateMessageLayout.messagePreview = metaData[0].BodyPreview;
        }
      };

      init();
    }
  };
}

notificationStreamModule.directive('privateMessage', privateMessage);

export default privateMessage;
