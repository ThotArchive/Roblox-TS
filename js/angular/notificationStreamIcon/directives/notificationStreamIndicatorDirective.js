import { RealTime } from 'Roblox';
import notificationStreamIconModule from '../notificationStreamIconModule';

function notificationStreamIndicator(
  notificationStreamUtility,
  $document,
  $log,
  notificationStreamService,
  eventStreamService
) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: notificationStreamUtility.templates.notificationStreamIndicatorTemplate,
    link(scope, element, attrs) {
      scope.layout = scope.layout || {};

      scope.getUnreadNotificationCount = function () {
        notificationStreamService
          .unreadCount()
          .then(
            function (data) {
              if (data) {
                const { unreadNotifications } = data;

                if (unreadNotifications > 0) {
                  // analytics event (indicating notifications unopened but
                  // unread count shown to users)
                  eventStreamService.sendEventWithTarget(
                    eventStreamService.eventNames.notificationStream.openCTA,
                    eventStreamService.context.seen,
                    { count: unreadNotifications, sendrVersion: 0 }
                  );
                }

                scope.layout.unreadNotifications = unreadNotifications;
              }
            },
            function () {
              $log.debug(
                '--- unreadCount call failed from notificationStreamIndicatorDirective----- '
              );
            }
          )
          .catch(e => {
            $log.error(e);
          });
      };

      function updateLayout(data) {
        scope.layout.unreadNotifications = data.count;
        scope.layout.isNotificationContentOpen = data.isNotificationContentOpen;
      }

      $document.bind('Roblox.NotificationStream.UpdateNotificationsCount', function (event, args) {
        $log.debug(` ----- notificationStreamIconController --- args.count --------${args.count}`);
        scope.$evalAsync(updateLayout(args));
      });

      $document.bind('Roblox.NotificationStream.ClearUnreadNotifications', () => {
        if (scope.layout.unreadNotifications > 0) {
          updateLayout({ count: 0, isNotificationContentOpen: true });
          notificationStreamService.clearUnread().then(() => {
            scope.layout.unreadNotifications = 0;
          });
        }
      });

      scope.initializeRealTimeSubscriptions = function () {
        if (angular.isDefined(RealTime)) {
          const realTimeClient = RealTime.Factory.GetClient();
          realTimeClient.Subscribe(
            notificationStreamUtility.notificationsName.NotificationStream,
            scope.getUnreadNotificationCount
          );
        }
      };

      if (!scope.layout || !scope.layout.isNotificationContentOpen) {
        scope.getUnreadNotificationCount();
        scope.initializeRealTimeSubscriptions();
      }

      // unregister old desktop push service worker -- start
      // we want to have the code running for a while to make sure
      // legacy service worker is uninstalled properly
      // TODO clean code after 2024/04/01
      const serviceWorkersSupported = function () {
        return 'serviceWorker' in navigator;
      };
      if (serviceWorkersSupported()) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          registrations.forEach(registration => {
            if (!registration.active?.scriptURL) {
              return;
            }

            const scriptUrl = new URL(registration.active.scriptURL);
            if (scriptUrl.pathname === '/service-workers/push-notifications') {
              registration.unregister();
            }
          });
        });
      }
      // unregister old desktop push service worker -- end
    }
  };
}

notificationStreamIconModule.directive('notificationStreamIndicator', notificationStreamIndicator);

export default notificationStreamIndicator;
