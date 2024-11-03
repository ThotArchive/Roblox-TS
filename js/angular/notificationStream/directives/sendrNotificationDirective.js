import { NotificationStreamService } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

function sendrNotification() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element) {
      element.ready(() => {
        NotificationStreamService?.renderSendrNotification(element[0]);
      });
    }
  };
}

notificationStreamModule.directive('sendrNotification', sendrNotification);

export default sendrNotification;
