import chatModule from '../chatModule';

function detailsController($scope, $log, chatService, chatUtility) {
  'ngInject';

  const initator = $scope.dialogData.initiator;
  const currentUserId = $scope.chatLibrary.userId;
  $scope.canConversationRemoveMember = function () {
    if ($scope.dialogData.dialogType !== $scope.dialogType.CHAT) {
      return initator && initator.id === currentUserId && !$scope.dialogData.isUserPending;
    }
    return false;
  };

  $scope.shouldShowAddUser = function () {
    return (
      !$scope.dialogData.isUserPending && chatUtility.getIsGroupChatEnabled($scope.chatLibrary)
    );
  };

  $scope.shouldShowPendingLabel = function (userId) {
    return $scope.dialogData.participantsMetadata?.[userId]?.is_pending;
  };

  $scope.maybeFetchParticipantMetadata = function() {
    const conversationId = $scope.dialogData.id;
    if (
      conversationId &&
      $scope.dialogData.source === 'channels' &&
      $scope.dialogLayout?.details?.isEnabled
    ) {
      chatService
        .getConversationsParticipantsMetadata([conversationId])
        .then(response => {
          $scope.dialogData.participantsMetadata =
            response?.conversation_participants_metadata?.[conversationId]?.participants_metadata;
        })
        .catch(err => {
          $log.error(err);
        });
    }
  };

  $scope.init = function () {
    $scope.maybeFetchParticipantMetadata();
  };

  $scope.init();

  $scope.$watch(
    () => $scope.dialogLayout?.details?.isEnabled,
    () => {
      $scope.maybeFetchParticipantMetadata();
    }
  );
}

chatModule.controller('detailsController', detailsController);

export default detailsController;
