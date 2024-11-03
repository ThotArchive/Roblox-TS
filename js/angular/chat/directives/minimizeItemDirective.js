import angular from 'angular';
import chatModule from '../chatModule';

function minimizeItem($log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      var openDialogOnClick = function() {
        scope.$apply(scope.openDialog(scope.dialogLayoutId));
      };
      angular
        .element('#dialogs-minimize')
        .on(
          'click touchstart',
          '.popover-content #' + scope.dialogLayoutId + ' .minimize-title',
          openDialogOnClick
        );

      var removeOnClick = function() {
        scope.$apply(scope.remove(scope.dialogLayoutId));
      };
      angular
        .element('#dialogs-minimize')
        .on(
          'click touchstart',
          '.popover-content #' + scope.dialogLayoutId + ' .minimize-close',
          removeOnClick
        );
    }
  };
}

chatModule.directive('minimizeItem', minimizeItem);

export default minimizeItem;
