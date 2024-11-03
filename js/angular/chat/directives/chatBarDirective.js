import chatModule from '../chatModule';

function chatBar(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    replace: true,
    templateUrl: resources.templates.chatBarTemplate
  };
}

chatModule.directive('chatBar', chatBar);

export default chatBar;
