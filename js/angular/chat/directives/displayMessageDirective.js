import chatModule from '../chatModule';

function displayMessage(resources, messageHelper) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: resources.templates.displayMessage,
    link(scope, element, attrs) {
      scope.initializeDisplayMessage = function() {
        scope.messageHelper = messageHelper;
        scope.displayMessage = scope.chatUser.displayMessage;
      };

      scope.initializeDisplayMessage();
    }
  };
}

chatModule.directive('displayMessage', displayMessage);

export default displayMessage;
