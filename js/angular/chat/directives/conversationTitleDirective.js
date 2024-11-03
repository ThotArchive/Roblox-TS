import chatModule from '../chatModule';

function conversationTitle(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    templateUrl: resources.templates.conversationTitleTemplate
  };
}

chatModule.directive('conversationTitle', conversationTitle);

export default conversationTitle;
