import chatModule from '../chatModule';

function userConversationInfoController($scope, $log, resources, eventStreamService) {
  'ngInject';

  $scope.hasGameAlbum = function() {
    let count = 0;
    let pinGameId = null;
    if ($scope.chatUser.pinGame) {
      count++;
      pinGameId = $scope.chatUser.pinGame.rootPlaceId;
    }
    if ($scope.chatUser.playTogetherIds) {
      if (pinGameId && $scope.chatUser.playTogetherIds.indexOf(pinGameId) > -1) {
        count = count + $scope.chatUser.playTogetherIds.length - 1;
      } else {
        count += $scope.chatUser.playTogetherIds.length;
      }
    }
    return count > 1;
  };

  $scope.isGameAvailableInChat = () => {
    return (
      $scope.chatUser.placeForShown &&
      $scope.chatUser.placeForShown.universeId &&
      $scope.chatUser.placeForShown.rootPlaceId
    );
  };

  $scope.openGameList = function() {
    if ($scope.hoverPopoverParams && !$scope.hoverPopoverParams.isOpen) {
      const eventType = resources.eventStreamParams.openGameListInPlayTogether;
      const properties = {
        conversationId: $scope.chatUser.id
      };
      eventStreamService.sendEventWithTarget(
        eventType,
        resources.eventStreamParams.actions.hover,
        properties
      );
    }
  };
  $scope.setupHoverPopover = function() {
    $scope.hoverPopoverParams = { ...resources.hoverPopoverParams };
    $scope.hoverPopoverParams.triggerSelector = `.chat-friend-${$scope.chatUser.id}`;
    $scope.hoverPopoverParams.hoverPopoverSelector = `.game-list-${$scope.chatUser.id}`;
  };

  $scope.shouldShowUnread = function() {
    return $scope.chatUser && $scope.chatUser.hasUnreadMessages && !$scope.chatUser.isUserPending;
  };

  $scope.init = function() {
    $scope.gamesListTemplateUrl = resources.templates.gamesList;
    $scope.setupHoverPopover();
  };

  $scope.init();
}

chatModule.controller('userConversationInfoController', userConversationInfoController);

export default userConversationInfoController;
