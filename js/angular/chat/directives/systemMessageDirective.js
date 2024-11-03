import chatModule from '../chatModule';

function systemMessage(resources, messageHelper) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: resources.templates.systemMessage,
    link(scope, element, attrs) {
      scope.messageHelper = messageHelper;
    }
  };
}

chatModule.directive('systemMessage', systemMessage);

export default systemMessage;
