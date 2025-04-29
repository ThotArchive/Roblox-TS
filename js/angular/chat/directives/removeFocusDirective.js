import chatModule from '../chatModule';

function removeFocus($log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      element.bind('click touchstart', function(e) {
        e.preventDefault();
        scope.sendMessage();
      });
    }
  };
}

chatModule.directive('removeFocus', removeFocus);

export default removeFocus;
