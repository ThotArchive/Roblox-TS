import notificationStreamIconModule from '../notificationStreamIconModule';
// possible delete
function notificationIndicator(notificationStreamUtility, $document, $log) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: notificationStreamUtility.templates.notificationIndicatorTemplate,
    link(scope, element, attrs) {
      function updateLayout(data) {
        scope.layout = scope.layout || {};
        scope.layout.unreadNotifications = data.count;
        scope.layout.isNotificationContentOpen = data.isNotificationContentOpen;
      }
      $document.bind('Roblox.NotificationStream.UnreadNotifications', function (event, args) {
        $log.debug(` ----- notificationStreamIconController --- args.count --------${args.count}`);
        scope.$evalAsync(updateLayout(args));
      });
    }
  };
}

notificationStreamIconModule.directive('notificationIndicator', notificationIndicator);

export default notificationIndicator;
