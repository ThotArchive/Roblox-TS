import { GameLauncher } from 'Roblox';
import { uuidService, urlService } from 'core-utilities';
import chatModule from '../chatModule';

function playTogetherController(
  $scope,
  $log,
  $window,
  modalService,
  gameService,
  playTogetherLayout,
  eventStreamService,
  pinGameService,
  gameParameters,
  chatUtility,
  gameLayout,
  pinGameLayout,
  playGameService
) {
  'ngInject';

  $scope.sendEventStream = function(eventType, rootPlaceId, gameInstanceId, joinAttemptId) {
    const properties = {
      placeId: rootPlaceId,
      conversationId: $scope.playTogether.id
    };
    if (gameInstanceId) {
      properties.gameInstanceId = gameInstanceId;
    }
    if (joinAttemptId) {
      properties.joinAttemptId = joinAttemptId;
    }
    eventStreamService.sendEventWithTarget(
      eventType,
      $scope.chatLibrary.eventStreamParams.actions.click,
      properties
    );
  };

  $scope.sendGamePlayEvent = function(rootPlaceId, joinAttemptId) {
    const { context } = $scope.chatLibrary.eventStreamParams;
    eventStreamService.sendGamePlayEvent(context.gamePlayFromPlayTogether, rootPlaceId, undefined, joinAttemptId);
  };

  $scope.buyAccess = function(rootPlaceId, layout) {
    const eventType = $scope.chatLibrary.eventStreamParams.clickBuyButtonInPlayTogether;
    $scope.sendEventStream(eventType, rootPlaceId);

    $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = true;

    const place = $scope.chatLibrary.placesLibrary[rootPlaceId];
    const { gameIconUrl } = place;
    const bodyText = layout.buyAccess.bodyText(
      place.encodedPlaceName,
      place.encodedCreatorName,
      place.price
    );
    const options = {
      titleText: layout.buyAccess.title,
      bodyText,
      imageUrl: gameIconUrl,
      actionButtonShow: true,
      actionButtonText: layout.buyAccess.yesButtonText,
      actionButtonClass: layout.buyAccess.yesButtonClass,
      neutralButtonText: layout.buyAccess.noButtonText,
      closeButtonShow: true
    };
    const modal = modalService.open(options);
    modal.result.then(
      function() {
        // make purchase
        $log.debug('--- purchase ---');
        $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = false;
      },
      function() {
        $log.debug('--- cancel ---');
        $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = false;
      }
    );
  };

  $scope.goToPlaceDetails = function(rootPlaceId) {
    const eventType = $scope.chatLibrary.eventStreamParams.clickViewDetailsButtonInPlayTogether;
    $scope.sendEventStream(eventType, rootPlaceId);

    $window.location.href = urlService.getAbsoluteUrl($scope.chatLibrary.placesLibrary[rootPlaceId].placeUrl);
  };

  $scope.joinGame = function(rootPlaceId) {
    const eventType = $scope.chatLibrary.eventStreamParams.clickJoinButtonInPlayTogether;
    const { placeId } = $scope.playTogether.playTogetherDict[rootPlaceId];
    const { gameInstanceId } = $scope.playTogether.playTogetherDict[rootPlaceId];
    const playerId = $scope.playTogether.playTogetherDict[rootPlaceId].playerIds
      ? $scope.playTogether.playTogetherDict[rootPlaceId].playerIds[0]
      : null;
    const playGameProperties = playGameService.buildPlayGameProperties(
      rootPlaceId,
      placeId,
      gameInstanceId,
      playerId
    );
    const properties = {
      placeId: rootPlaceId,
      conversationId: $scope.playTogether.id
    };
    if (gameInstanceId) {
      properties.gameInstanceId = gameInstanceId;
    }
    const eventStreamProperties = {
      eventName: $scope.chatLibrary.eventStreamParams.clickJoinButtonInPlayTogether,
      ctx: $scope.chatLibrary.eventStreamParams.actions.click,
      properties,
      gamePlayIntentEventCtx: $scope.chatLibrary.eventStreamParams.context.gamePlayFromPlayTogether
    };
    playGameService.launchGame(playGameProperties, eventStreamProperties);
  };

  $scope.playGame = function(rootPlaceId, conversationId) {
    const joinAttemptId = GameLauncher.isJoinAttemptIdEnabled() ? uuidService.generateRandomUuid() : undefined;
    const { gamePlayFromPlayTogether } = $scope.chatLibrary.eventStreamParams.context;
    const eventType = $scope.chatLibrary.eventStreamParams.clickPlayButtonInPlayTogether;
    $scope.sendEventStream(eventType, rootPlaceId, undefined, joinAttemptId);
    $scope.sendGamePlayEvent(rootPlaceId, joinAttemptId);
    gameService.playTogetherGame(rootPlaceId, conversationId, joinAttemptId, gamePlayFromPlayTogether);
  };

  $scope.joinGameFromPlayTogether = function(rootPlaceId) {
    rootPlaceId = parseInt(rootPlaceId);
    const buttonType = $scope.playTogether.placeButtonLayout[rootPlaceId].type;
    const conversationId = $scope.playTogether.id;

    switch (buttonType) {
      case gameLayout.playButtonTypes.join:
        $scope.joinGame(rootPlaceId);
        break;
      case gameLayout.playButtonTypes.play:
        $scope.playGame(rootPlaceId, conversationId);
        break;
      case gameLayout.playButtonTypes.buy:
        $scope.buyAccess(rootPlaceId, gameLayout);
        break;
      case gameLayout.playButtonTypes.details:
        $scope.goToPlaceDetails(rootPlaceId);
        break;
    }
  };

  $scope.toggleActiveGameList = function() {
    $scope.playTogetherLayout.activeGamesList.isCollapsed = !$scope.playTogetherLayout
      .activeGamesList.isCollapsed;
    if ($scope.playTogetherLayout.activeGamesList.isCollapsed) {
      $scope.playTogetherLayout.activeGamesList.toggleMenuText =
        $scope.playTogetherLayout.activeGamesList.showMoreText;
      $scope.playTogetherLayout.activeGamesList.limitNumber =
        $scope.playTogetherLayout.activeGamesList.minNumberForFit;
    } else {
      $scope.playTogetherLayout.activeGamesList.toggleMenuText =
        $scope.playTogetherLayout.activeGamesList.showLess;
      $scope.playTogetherLayout.activeGamesList.limitNumber =
        $scope.playTogetherLayout.numberOfActiveGames;
    }
  };

  $scope.hasPinGameAndActiveGames = function() {
    if ($scope.hasActiveGames() && $scope.playTogether.pinGame) {
      if ($scope.playTogether.playTogetherIds.length === 1) {
        return $scope.playTogether.playTogetherIds[0] !== $scope.playTogether.pinGame.rootPlaceId;
      }
      return true;
    }
    return false;
  };

  $scope.hasActiveGames = function() {
    let pinGameIsInActiveGames = false;
    if (!$scope.playTogether.playTogetherIds) {
      return 0;
    }
    if ($scope.playTogether.pinGame) {
      pinGameIsInActiveGames =
        $scope.playTogether.playTogetherIds.indexOf($scope.playTogether.pinGame.rootPlaceId) > -1;
      $scope.playTogetherLayout.activeGamesList.pinGameIsInActiveGames = pinGameIsInActiveGames;
    }
    return pinGameIsInActiveGames
      ? $scope.playTogether.playTogetherIds.length - 1
      : $scope.playTogether.playTogetherIds.length;
  };

  $scope.unPinGame = function() {
    if ($scope.playTogether && $scope.playTogether.pinGame) {
      const eventType = $scope.chatLibrary.eventStreamParams.unpinGameInPlayTogether;
      const { rootPlaceId } = $scope.playTogether.pinGame;
      pinGameService.sendPinGameEvent(eventType, rootPlaceId, $scope.playTogether);
      pinGameService.setPinGameData($scope.playTogether);
      pinGameService.unpinGame($scope.playTogether);
      gameService.updateButtonLayoutPerConversation($scope.playTogether, rootPlaceId);
      chatUtility.updateScrollbar(playTogetherLayout.gameListScrollListSelector);
    }
  };

  $scope.pinGame = function(universeId, rootPlaceId) {
    universeId = parseInt(universeId);
    rootPlaceId = parseInt(rootPlaceId);
    const eventType = $scope.chatLibrary.eventStreamParams.pinGameInPlayTogether;
    pinGameService.sendPinGameEvent(eventType, rootPlaceId, $scope.playTogether);
    const parameters = {
      rootPlaceId,
      universeId,
      actorUsername: $scope.chatLibrary.name,
      userId: $scope.chatLibrary.userId,
      placeName:
        $scope.chatLibrary.placesLibrary && $scope.chatLibrary.placesLibrary[rootPlaceId]
          ? $scope.chatLibrary.placesLibrary[rootPlaceId].placeName
          : '',
      encodedPlaceName:
        $scope.chatLibrary.placesLibrary && $scope.chatLibrary.placesLibrary[rootPlaceId]
          ? $scope.chatLibrary.placesLibrary[rootPlaceId].encodedPlaceName
          : ''
    };
    pinGameService.setPinGameData($scope.playTogether, parameters);
    pinGameService.pinGame($scope.playTogether, universeId);
    gameService.updateButtonLayoutPerConversation($scope.playTogether, rootPlaceId);
  };

  $scope.initData = function() {
    $scope.playTogetherLayout = Object.assign({}, playTogetherLayout);
    $scope.gameParameters = Object.assign({}, gameParameters);
    $scope.gameLayout = Object.assign({}, gameLayout);
    $scope.pinGameLayout = Object.assign({}, pinGameLayout);
    if ($scope.dialogData) {
      $scope.playTogether = $scope.dialogData;
      $scope.playTogether.inDialog = true;
      $scope.playTogetherLayout.numberOfActiveGames = $scope.hasActiveGames();
      const { numberOfActiveGames } = $scope.playTogetherLayout;
      const {
        isCollapsed,
        pinGameIsInActiveGames,
        limitNumber,
        minNumberForFit,
        maxNumberForFit,
        showLess
      } = $scope.playTogetherLayout.activeGamesList;
      if (pinGameIsInActiveGames) {
        const activeGamesListUpdate = {
          limitNumber: limitNumber + 1,
          minNumberForFit: minNumberForFit + 1,
          maxNumberForFit: maxNumberForFit + 1
        };
        const { activeGamesList } = $scope.playTogetherLayout;
        Object.assign(activeGamesList, activeGamesListUpdate);
      }
      let limitCount = numberOfActiveGames - minNumberForFit;
      limitCount = limitCount > 0 ? limitCount : 0;
      const showMoreText = $scope.playTogetherLayout.activeGamesList.showMore(limitCount);
      $scope.playTogetherLayout.activeGamesList.showMoreText = showMoreText;
      if ($scope.playTogetherLayout.numberOfActiveGames > 1) {
        $scope.playTogetherLayout.activeGamesList.toggleMenuText = isCollapsed
          ? showMoreText
          : showLess;
      }
    } else {
      $scope.playTogether = $scope.chatUser;
      $scope.playTogether.inDialog = false;
      $scope.playTogetherLayout.numberOfActiveGames = $scope.hasActiveGames();
      $scope.playTogetherLayout.activeGamesList.limitNumber =
        $scope.playTogetherLayout.numberOfActiveGames;
    }
    $scope.chatLibrary.playTogetherLibrary[$scope.playTogether.id] = {
      layout: $scope.playTogetherLayout
    };
  };

  $scope.initData();
}

chatModule.controller('playTogetherController', playTogetherController);

export default playTogetherController;
