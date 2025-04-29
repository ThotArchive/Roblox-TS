import chatModule from '../chatModule';

function repeatDone(chatUtility, playTogetherLayout) {
  'ngInject';

  return {
    link(scope, elem, attrs) {
      chatUtility.buildScrollbar(playTogetherLayout.gameListScrollListSelector);
    }
  };
}

chatModule.directive('repeatDone', repeatDone);

export default repeatDone;
