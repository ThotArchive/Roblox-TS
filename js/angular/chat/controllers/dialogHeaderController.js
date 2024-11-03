import chatModule from '../chatModule';

function dialogHeaderController($scope, $log, resources, eventStreamService) {
  'ngInject';

  $scope.isGameIconAvailable = function () {
    return $scope.isPinOrActiveGameAvailable();
  };

  $scope.isPinOrActiveGameAvailable = function () {
    return (
      $scope.dialogData.placeForShown &&
      $scope.dialogData.placeForShown.universeId &&
      $scope.dialogData.placeForShown.rootPlaceId
    );
  };

  $scope.openGameList = function () {
    const eventType = resources.eventStreamParams.openGameListInPlayTogether;
    const properties = {
      conversationId: $scope.dialogData.id
    };
    eventStreamService.sendEventWithTarget(
      eventType,
      resources.eventStreamParams.actions.click,
      properties
    );
  };

  $scope.init = function () {
    $scope.gamesListTemplateUrl = resources.templates.gamesList;
  };

  $scope.init();
}

chatModule.controller('dialogHeaderController', dialogHeaderController);

export default dialogHeaderController;
