import notificationStreamModule from '../notificationStreamModule';

// for notification stream embedded page (in mobile)
function notificationStreamBase(notificationStreamUtility, $log) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: notificationStreamUtility.templates.notificationStreamBaseViewTemplate
  };
}

notificationStreamModule.directive('notificationStreamBase', notificationStreamBase);

export default notificationStreamBase;
