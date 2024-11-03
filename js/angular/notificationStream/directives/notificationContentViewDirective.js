import notificationStreamModule from '../notificationStreamModule';

function notificationContentView(notificationStreamUtility, $log) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: notificationStreamUtility.templates.notificationContentViewTemplate,

    scope: {
      library: '=',
      contentViewManager: '=',
      viewId: '@',
      isActive: '=?'
    },

    link(scope, element, attrs) {
      // Add this view to the notificationsController's collection of content views.
      scope.contentViewManager.addContentView(scope);
    }
  };
}

notificationStreamModule.directive('notificationContentView', notificationContentView);

export default notificationContentView;
