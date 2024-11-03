import notificationStreamIconModule from '../notificationStreamIconModule';
// possible delete
function notificationStreamIcon(notificationStreamUtility, $log) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: notificationStreamUtility.templates.notificationStreamIconTemplate
  };
}

notificationStreamIconModule.directive('a', notificationStreamIcon);

export default notificationStreamIcon;
