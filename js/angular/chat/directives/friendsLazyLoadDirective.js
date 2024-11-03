import chatModule from '../chatModule';

function friendsLazyLoad(friendsService, $log, $document) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      scope.callbackLazyLoad = function () {
        if (
          !scope.chatLibrary.chatLayout.isFriendsLoading &&
          scope.chatLibrary.currentFriendCursor !== null &&
          scope.chatLibrary.currentFriendCursor !== ''
        ) {
          scope.chatLibrary.chatLayout.isFriendsLoading = true;
          friendsService
            .getPaginatedFriends(scope.chatLibrary.userId, scope.chatLibrary.currentFriendCursor)
            .then(
              result => {
                if (result?.PageItems.length) {
                  scope.updateFriendsDictData(result.PageItems);
                  scope.chatLibrary.chatLayout.isFriendsLoading = false;
                  scope.chatLibrary.currentFriendCursor = result.NextCursor;
                }
              },
              error => {
                console.debug(error);
              }
            );
        }
      };

      element.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 100,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true
        },
        callbacks: {
          onTotalScrollOffset: 100,
          onTotalScroll: scope.callbackLazyLoad,
          onOverflowYNone: scope.callbackLazyLoad
        }
      });
    }
  };
}

chatModule.directive('friendsLazyLoad', friendsLazyLoad);

export default friendsLazyLoad;
