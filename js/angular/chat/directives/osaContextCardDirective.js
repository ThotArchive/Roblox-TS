import chatModule from '../chatModule';

function osaContextCard(resources, chatService, messageService, chatUtility) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: resources.templates.osaContextCardTemplate,
    link(scope) {
      if (
        scope.dialogData.osaAcknowledgementStatus !==
        chatUtility.osaAcknowledgementStatus.UNACKNOWLEDGED
      ) {
        return;
      }

      chatService
        .recordModalSequenceResponse({
          conversationId: scope.dialogData.source === chatUtility.conversationSource.CHANNELS ? scope.dialogData.id : null,
          friendId: scope.dialogData.source === chatUtility.conversationSource.FRIENDS ? scope.dialogData.id : null,
          modalSequence: chatUtility.modalSequence.CONVERSATION_INLINE_TOP_MODAL,
          modalVariant: chatUtility.modalVariant.OSA_CONTEXT_CARD,
          actionType: chatUtility.modalActionType.RECORD_HAS_SEEN
        })
        .then(response => {
          if (response.status !== chatUtility.resultType.SUCCESS) {
            return;
          }

          scope.dialogData.osaAcknowledgementStatus =
            chatUtility.osaAcknowledgementStatus.ACKNOWLEDGED;

          if (scope.dialogData.source === chatUtility.conversationSource.CHANNELS) {
            // fetch the latest messages again and refresh the preview message
            chatService
              .getMessages(scope.dialogData.id, null, scope.dialogParams.pageSizeOfGetMessages)
              .then(response => {
                const data = response.messages;
                if (data && data.length > 0) {
                  messageService.updatePreviewMessage(scope.dialogData, data);
                }
              });
          }
        });
    }
  };
}

chatModule.directive('osaContextCard', osaContextCard);

export default osaContextCard;
