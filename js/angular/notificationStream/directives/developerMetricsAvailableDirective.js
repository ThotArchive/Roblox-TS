import { Intl } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

function developerMetricsAvailable(
  $window,
  notificationStreamUtility,
  urlService,
  eventStreamService
) {
  'ngInject';

  function getMonthName(month) {
    const months = new Intl().getMonthsList('long');
    for (let i = 0, len = months.length; i < len; i++) {
      if (months[i].value === month) {
        return months[i].name;
      }
    }
    return '';
  }

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
    templateUrl: notificationStreamUtility.templates.developerMetricsAvailableTemplate,
    link(scope, element, attrs) {
      const init = function () {
        scope.notificationSourceType = notificationStreamUtility.notificationSourceType;
        scope.developerMetricsAvailableLayout = {
          month: '',
          year: '',
          universeId: -1,
          gameName: '',
          gameNameLinked: '',
          rootPlaceId: -1,
          gameLinkUrl: null,
          gameIconUrl: null
        };
        const metaData = scope.notification.metadataCollection;
        if (metaData && metaData.length > 0) {
          const validData = metaData[0];
          const url = urlService.getAbsoluteUrl(`/places/${validData.rootPlaceId}/stats`);
          scope.developerMetricsAvailableLayout.month = getMonthName(validData.month);
          scope.developerMetricsAvailableLayout.year = validData.year;
          scope.developerMetricsAvailableLayout.universeId = validData.universeId;
          scope.developerMetricsAvailableLayout.gameName = validData.gameName;
          scope.developerMetricsAvailableLayout.gameNameLinked = `<a class="text-name font-caption-header" href="${url}">${validData.gameName}</a>`;
          scope.developerMetricsAvailableLayout.rootPlaceId = validData.rootPlaceId;
          scope.developerMetricsAvailableLayout.gameLinkUrl = url;
          scope.developerMetricsAvailableLayout.notificationId = scope.notification.id;

          // Handler to launch game when view button is clicked.
          scope.viewButtonHandler = function () {
            $window.location.href = scope.developerMetricsAvailableLayout.gameLinkUrl;

            const eventName = eventStreamService.eventNames.notificationStream.viewDeveloperMetrics;
            const properties = {
              notificationId: scope.developerMetricsAvailableLayout.notificationId,
              notificationType:
                notificationStreamUtility.notificationSourceType.developerMetricsAvailable,
              universeId: scope.developerMetricsAvailableLayout.universeId,
              sendrVersion: 0
            };

            eventStreamService.sendEventWithTarget(
              eventName,
              eventStreamService.context.click,
              properties
            );
          };
        }
      };

      init();
    }
  };
}

notificationStreamModule.directive('developerMetricsAvailable', developerMetricsAvailable);

export default developerMetricsAvailable;
