import chatModule from '../chatModule';

function backBtn($log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      element.bind('click touchstart', function(e) {
        e.preventDefault();
        scope.closeDialog(scope.dialogData.layoutId);
      });
    }
  };
}

chatModule.directive('backBtn', backBtn);

export default backBtn;
