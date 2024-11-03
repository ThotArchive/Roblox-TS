import chatModule from '../chatModule';

function lazyLoad(
  chatService,
  chatUtility,
  $log,
  $document,
  conversationsUtility,
  usersService,
  contactsService,
) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      scope.callbackLazyLoad = function () {
        if (
          !scope.chatApiParams ||
          scope.chatLibrary.chatLayout.errorMaskEnable ||
          !scope.chatApiParams.loadMoreConversations
        ) {
          return false;
        }
        scope.chatLibrary.chatLayout.isChatLoading = true;
        if (scope.chatApiParams.loadMoreConversations) {
          const cursor = scope.chatApiParams.getUserConversationsNextCursor;
          chatService
            .getUserConversations(
              cursor,
              scope.chatApiParams.pageSizeOfConversations,
              scope.chatLibrary.friendsDict
            )
            .then(
              response => {
                const data = response.conversations;
                let userIds = [];
                const { friendsDict } = scope.chatLibrary;
                userIds = conversationsUtility.getUserIdsNotInFriendsDict(data, friendsDict);

                scope.chatLibrary.chatLayout.isChatLoading = false;
                if (data && data.length > 0) {
                  scope.buildChatUserListByConversations(data);
                  scope.chatApiParams.getUserConversationsNextCursor = response.next_cursor;
                  chatUtility.updateScrollbar(chatUtility.chatLayout.scrollbarClassName);
                  const isEndOfConversations = !response.next_cursor;
                  if (isEndOfConversations) {
                    scope.chatApiParams.loadMoreConversations = false;
                    scope.chatApiParams.getUserConversationsNextCursor = null;
                  }
                } else {
                  scope.chatApiParams.loadMoreConversations = false;
                  scope.chatApiParams.getUserConversationsNextCursor = null;
                }
                contactsService.getUserContacts(userIds, friendsDict);
                return usersService.getUserInfo(userIds, friendsDict);
              },
              function error() {
                scope.chatLibrary.chatLayout.isChatLoading = false;
                $log.debug('---error from get Conversations in lazyLoadDirective.js---');
              }
            );
        }
      };

      scope.callbackScrollStart = function () {
        scope.$broadcast('Roblox.Chat.ConversationListScroll');
        $document.triggerHandler('HoverPopover.EnableClose');
      };

      element.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 5,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true
        },
        callbacks: {
          onTotalScrollOffset: 100,
          onTotalScroll: scope.callbackLazyLoad,
          onOverflowYNone: scope.callbackLazyLoad,
          onScrollStart: scope.callbackScrollStart
        }
      });
    }
  };
}

chatModule.directive('lazyLoad', lazyLoad);

export default lazyLoad;
