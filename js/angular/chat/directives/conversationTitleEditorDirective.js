import chatModule from '../chatModule';

function conversationTitleEditor(resources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    templateUrl: resources.templates.conversationTitleEditorTemplate
  };
}

chatModule.directive('conversationTitleEditor', conversationTitleEditor);

export default conversationTitleEditor;
