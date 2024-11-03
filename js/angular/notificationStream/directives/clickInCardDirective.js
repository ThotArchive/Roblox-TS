import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function clickInCard(eventStreamService, hybridService, notificationStreamUtility, $log, $filter) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      element.bind('click', function (event) {
        if (!event.target) {
          return false;
        }

        const selectedElm = angular.element(event.target);
        const eventType = selectedElm.attr('type');
        const properties = angular.copy(scope.library.eventStreamMetaData);
        properties.sendrVersion = 0;

        const elementEventType = element.attr('type');
        let eventName = eventStreamService.eventNames.notificationStream[elementEventType];
        if (eventName !== null && scope.notification) {
          properties.notificationType = scope.notification.notificationSourceType;
          properties.notificationId = scope.notification.id;

          eventStreamService.sendEventWithTarget(
            eventName,
            eventStreamService.context.click,
            properties
          );
        }

        if (event.target && eventType) {
          if (scope.notification) {
            properties.notificationType = scope.notification.notificationSourceType;
            scope.interactNotification(scope.notification);
          }

          eventName = eventStreamService.eventNames.notificationStream[eventType];
          eventStreamService.sendEventWithTarget(eventName, event.type, properties);

          if (scope.library.inApp) {
            event.stopPropagation();
            event.preventDefault();
            switch (eventType) {
              case notificationStreamUtility.links.settingLinkName:
                var params = {
                  feature: notificationStreamUtility.links.settingTabName,
                  urlPath: notificationStreamUtility.links.settingLink
                };
                hybridService.navigateToFeature(params, function (status) {
                  $log.debug(`navigateToFeature ---- status:${status}`);
                });
                break;
              case notificationStreamUtility.links.friendRequestLinkName:
                var params = {
                  feature: notificationStreamUtility.links.friendRequestTabName,
                  urlPath: notificationStreamUtility.links.friendRequestLink
                };
                hybridService.navigateToFeature(params, function (status) {
                  $log.debug(`openUserProfile ---- status:${status}`);
                });
                break;
              case notificationStreamUtility.links.profileLinkName:
                var userId;
                if (
                  selectedElm.attr('href') &&
                  selectedElm.attr('href').match(/users\/(\d+)/, '')
                ) {
                  userId = selectedElm.attr('href').match(/users\/(\d+)/, '')[1];
                } else {
                  userId = scope.userIds[0];
                }
                hybridService.openUserProfile(parseInt(userId), function (status) {
                  $log.debug(`openUserProfile ---- status:${status}`);
                });
                break;
              case notificationStreamUtility.links.groupLinkName:
                var url;
                if (
                  selectedElm.attr('href') &&
                  selectedElm.attr('href').match(/groups\/(\d+)/, '')
                ) {
                  const groupId = selectedElm.attr('href').match(/groups\/(\d+)/, '')[1];
                  url = $filter('formatString')(notificationStreamUtility.links.groupLink, {
                    id: groupId
                  });
                } else {
                  url = notificationStreamUtility.links.myGroupsLink;
                }
                params = {
                  feature: notificationStreamUtility.links.groupsTabName,
                  urlPath: url
                };
                hybridService.navigateToFeature(params, function (status) {
                  $log.debug(`openGroupDetails ---- status:${status}`);
                });
                break;
              default:
                break;
            }
            return false;
          }
        }
      });
    }
  };
}

notificationStreamModule.directive('clickInCard', clickInCard);

export default clickInCard;
