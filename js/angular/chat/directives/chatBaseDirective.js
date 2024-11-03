import chatModule from '../chatModule';

function chatBase(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templates.chatBaseTemplate
  };
}

chatModule.directive('chatBase', chatBase);

export default chatBase;
