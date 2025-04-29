import chatModule from '../chatModule';

function chatDialogScrollbar($log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      element.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 5,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true
        },
        advanced: {
            autoScrollOnFocus: false // prevents the browser from jumping to the 'Leave Group' button when clicking on it (SOC-279)
        }
      });
    }
  };
}

chatModule.directive('chatDialogScrollbar', chatDialogScrollbar);

export default chatDialogScrollbar;
