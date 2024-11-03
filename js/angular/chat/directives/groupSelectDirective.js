import angular from 'angular';
import chatModule from '../chatModule';

function groupSelect($log) {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      const heightOfHeader = scope.chatLibrary.layout.topBarHeight;
      scope.$watch(
        function() {
          return element.innerHeight();
        },
        function(newValue, oldValue) {
          if (newValue && newValue !== oldValue) {
            const dialogElm = `#${scope.dialogData.layoutId} .dialog-container`;
            const scrollbarElm = `#${scope.dialogData.layoutId} ${scope.friendsScrollbarElm}`;
            const dialogObj = angular.element(dialogElm);
            const scrollbarObj = angular.element(scrollbarElm);
            let heightOfDialog;
            let heightOfScrollbar;
            let valueExcludedFromHeight;
            valueExcludedFromHeight = heightOfHeader + newValue;
            heightOfDialog = dialogObj.height();
            heightOfScrollbar = heightOfDialog - valueExcludedFromHeight;

            scrollbarObj.css('height', heightOfScrollbar);
            scrollbarObj.mCustomScrollbar('update');
          }
        },
        true
      );
    }
  };
}

chatModule.directive('groupSelect', groupSelect);

export default groupSelect;
