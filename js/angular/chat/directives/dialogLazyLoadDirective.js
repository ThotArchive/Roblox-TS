import angular from 'angular';
import chatModule from '../chatModule';

function dialogLazyLoad(chatService, chatUtility, messageService, gameService, $log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      scope.callbackScrollToBottom = function() {
        scope.updateDialog();
      };

      scope.callbackLazyLoad = function() {
        if (
          !scope.dialogParams.loadMoreMessages ||
          !scope.dialogLayout.IsdialogContainerVisible ||
          scope.dialogData.dialogType === chatUtility.dialogType.FRIEND
        ) {
          return false;
        }
        scope.dialogLayout.isChatLoading = true;
        const sizeOfMessages = scope.dialogData.chatMessages.length;
        const cursor = scope.dialogParams.getMessagesNextCursor;
        chatService
          .getMessages(scope.dialogData.id, cursor, scope.dialogParams.pageSizeOfGetMessages)
          .then(
            function(response) {
              const data = response.messages;
              scope.dialogLayout.isChatLoading = false;
              if (!data) {
                scope.dialogParams.loadMoreMessages = false;
                messageService.processMessages(
                  scope.chatLibrary,
                  scope.dialogData,
                  data,
                  scope.chatLibrary.friendsDict
                );
                gameService.fetchDataForLinkCard(data, scope.chatLibrary);
              } else {
                if (angular.isUndefined(scope.dialogData.messagesDict)) {
                  scope.dialogData.messagesDict = {};
                }
                scope.dialogParams.getMessagesNextCursor = response.next_cursor;
                if (data.length > 0) {
                  scope.dialogLayout.scrollToBottom = false;

                  messageService.preProcessMessages(scope.chatLibrary, scope.dialogData, data);
                  for (let i = 0; i < data.length; i++) {
                    const message = data[i];
                    if (message.type === chatUtility.messageSenderType.SYSTEM) {
                      message.isSystemMessage = true;
                    }
                    messageService.buildFallbackTimeStamp(message, scope.dialogData);
                    const isMessagePresentInMessagesDict =
                      angular.isDefined(message.id) &&
                      angular.isDefined(scope.dialogData.messagesDict[message.id]);
                    if (!isMessagePresentInMessagesDict) {
                      messageService.setFallbackClusterMaster(scope.dialogData, message);
                      if (angular.isDefined(message.id)) {
                        scope.dialogData.messagesDict[message.id] = message;
                      }
                    }
                  }
                  gameService.fetchDataForLinkCard(data, scope.chatLibrary);
                }
                const isEndOfMessages = !response.next_cursor;
                if (isEndOfMessages) {
                  scope.dialogParams.loadMoreMessages = false;
                }
              }
            },
            function() {
              scope.dialogLayout.isChatLoading = false;
              $log.debug('---error from get getMessages in dialogLazyLoadDirective.js---');
            }
          );
      };

      let init = function() {
        $log.debug('---- onInit callback ---- Scrollbars updated');
        if (chatUtility.shouldScrollFromTop(scope.dialogData, scope.chatLibrary)) {
          scope.updateDialog();
        } else {
          scope.dialogLayout.scrollToBottom = true;
        }
      };

      element.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 5,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true
        },
        callbacks: {
          onInit: init,
          onUpdate() {
            $log.debug(
              '---- onUpdate callback ---- Scrollbars updated' + scope.dialogLayout.scrollToBottom
            );
            if (scope.dialogLayout.scrollToBottom) {
              element.mCustomScrollbar('scrollTo', 'bottom', {
                scrollInertia: 0
              });
              if (scope.chatLibrary.useOneToOneOsaContextCards) {
                scope.dialogLayout.scrollToBottom = false;
              }
            } else if (!scope.chatLibrary.useOneToOneOsaContextCards) {
              scope.dialogLayout.scrollToBottom = true;
            }

            if (element.hasClass('mCS_no_scrollbar')) {
              // equivalent to (element.has(":mcsOverflow") && !element.is(":mcsOverflow"))
              scope.updateDialog();
            }
          },
          onTotalScroll: scope.callbackScrollToBottom,
          onTotalScrollOffset: 60,
          onTotalScrollBack: scope.callbackLazyLoad
        }
      });
    }
  };
}

chatModule.directive('dialogLazyLoad', dialogLazyLoad);

export default dialogLazyLoad;
