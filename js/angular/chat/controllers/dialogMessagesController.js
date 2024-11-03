import chatModule from '../chatModule';

function dialogMessagesController($scope, $log, messageUtility, chatUtility) {
  'ngInject';

  $scope.canRenderMessage = function(message) {
    if (message.sendingMessage) {
      return true;
    }

    return (
      message.isSystemMessage ||
      messageUtility.isMessageTypeLegal(message)
    );
  };

  $scope.isMessageOutgoingTrustedComms = function (message) {
    return (
      $scope.chatLibrary.isTrustedCommsWebEnabled &&
      message &&
      message.sender_user_id === $scope.chatLibrary.userId &&
      message.moderation_type === chatUtility.moderationType.TRUSTED_COMMS
    );
  };
}

chatModule.controller('dialogMessagesController', dialogMessagesController);

export default dialogMessagesController;
