import chatModule from '../chatModule';

function chatPlaceholder(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    templateUrl: resources.templates.chatPlaceholderTemplate
  };
}

chatModule.directive('chatPlaceholder', chatPlaceholder);

export default chatPlaceholder;
