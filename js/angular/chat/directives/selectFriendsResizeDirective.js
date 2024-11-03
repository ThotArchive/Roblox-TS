import angular from 'angular';
import chatModule from '../chatModule';

function selectFriendsResize(chatUtility, $log) {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      let heightOfHeader = scope.chatLibrary.layout.topBarHeight;
      scope.$watch(
        function() {
          return element.innerHeight();
        },
        function(newValue, oldValue) {
          if (newValue && newValue !== oldValue) {
            var dialogElm = '#' + scope.dialogData.layoutId + ' .dialog-container';
            var scrollbarElm = '#' + scope.dialogData.layoutId + ' ' + scope.friendsScrollbarElm;
            let dialogObj = angular.element(dialogElm);
            let scrollbarObj = angular.element(scrollbarElm);
            let heightOfDialog; var heightOfScrollbar;
            var valueExcludedFromHeight =
              heightOfHeader + scope.chatLibrary.layout.detailsActionHeight + newValue;
            if (scope.dialogData.dialogType === chatUtility.dialogType.NEWGROUPCHAT) {
              valueExcludedFromHeight += scope.chatLibrary.layout.detailsInputHeight;
            }
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

chatModule.directive('selectFriendsResize', selectFriendsResize);

export default selectFriendsResize;
