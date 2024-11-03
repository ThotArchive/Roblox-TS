import { NotificationStreamService } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

function sendrMetaActionsList() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element) {
      element.ready(() => {
        NotificationStreamService?.renderSendrModalContainer(element[0]);
      });
    }
  };
}

notificationStreamModule.directive('sendrMetaActionsList', sendrMetaActionsList);

export default sendrMetaActionsList;
