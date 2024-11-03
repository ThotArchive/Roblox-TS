import { GameLauncher } from 'Roblox';
import { uuidService, urlService } from 'core-utilities';
import { elementVisibilityService } from 'core-roblox-utilities';
import chatModule from '../chatModule';

function linkCardController(
  $scope,
  $element,
  $log,
  eventStreamService,
  gameService,
  modalService,
  $window,
  $filter,
  pinGameService,
  gameLayout
) {
  'ngInject';

  $scope.isLinkCardAvailableAndParsedByClientSide = function (pieceOfMessage) {
    return !pieceOfMessage.isLinkCard && pieceOfMessage.isCard;
  };

  $scope.sendEventStream = function (eventType, rootPlaceId, joinAttemptId) {
    const properties = {
      placeId: rootPlaceId,
      conversationId: $scope.dialogData.id
    };
    if (joinAttemptId) {
      properties.joinAttemptId = joinAttemptId;
    }
    eventStreamService.sendEventWithTarget(
      eventType,
      $scope.chatLibrary.eventStreamParams.actions.click,
      properties
    );
  };

  $scope.sendLoadLinkCardEvent = function (rootPlaceId) {
    const properties = {
      placeId: rootPlaceId,
      conversationId: $scope.dialogData.id
    };
    eventStreamService.sendEventWithTarget(
      $scope.chatLibrary.eventStreamParams.loadGameLinkCardInChat,
      $scope.chatLibrary.eventStreamParams.actions.render,
      properties
    );
  };

  $scope.sendGamePlayEvent = function (rootPlaceId, joinAttemptId) {
    const { context } = $scope.chatLibrary.eventStreamParams;
    eventStreamService.sendGamePlayEvent(
      context.gamePlayFromLinkCard,
      rootPlaceId,
      undefined,
      joinAttemptId
    );
  };

  $scope.playGame = function (rootPlaceId, eventType, addition) {
    const joinAttemptId = GameLauncher.isJoinAttemptIdEnabled() ? uuidService.generateRandomUuid() : undefined;
    const { context } = $scope.chatLibrary.eventStreamParams;
    $scope.sendEventStream(eventType, rootPlaceId, joinAttemptId);
    $scope.sendGamePlayEvent(rootPlaceId, joinAttemptId);
    if (addition && addition.privateServerLinkCode) {
      gameService.playPrivateServerGame(
        rootPlaceId,
        addition.privateServerLinkCode,
        joinAttemptId,
        context.gamePlayFromLinkCard
      );
    } else if ($scope.chatLibrary.chatLayout.playTogetherGameCardsEnabled) {
      gameService.playTogetherGame(
        rootPlaceId,
        $scope.dialogData.id,
        joinAttemptId,
        context.gamePlayFromLinkCard
      );
    } else {
      gameService.playRegularGame(rootPlaceId, false, joinAttemptId, context.gamePlayFromLinkCard);
    }
  };

  $scope.buyAccess = function (placeId, layout) {
    const place = $scope.chatLibrary.placesLibrary[placeId];
    const { gameIconUrl } = place;
    const bodyText = $filter('formatString')(layout.buyAccess.bodyText(), {
      placeName: place.placeName,
      creatorName: place.creatorName,
      price: place.price
    });
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
    $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = true;
    const modal = modalService.open(options);
    modal.result.then(
      function () {
        // make purchase
        $log.debug('--- purchase ---');
        $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = false;
      },
      function () {
        $log.debug('--- cancel ---');
        $scope.dialogLayout.playTogetherButton.isPlayButtonDisabled = false;
      }
    );
  };

  $scope.goToPlaceDetails = function (rootPlaceId, eventType) {
    const place = $scope.chatLibrary.placesLibrary[rootPlaceId];
    const urlParams = {
      universeId: place.universeId,
      placeId: rootPlaceId,
      position: 0,
      page: $scope.chatLibrary.eventStreamParams.pageContext.linkCardInChat,
    };

    $scope.sendEventStream(eventType, rootPlaceId);
    const url = `${place.placeUrl}?${urlService.composeQueryString(urlParams)}`;
    $window.location.href = urlService.getAbsoluteUrl(url);
  };

  $scope.play = function (placeId, eventType, addition) {
    const buttonType = $scope.chatLibrary.placesLibrary[placeId].buttonLayoutForLinkCard.type;
    switch (buttonType) {
      case gameLayout.playButtonTypes.play:
        $scope.playGame(placeId, eventType, addition);
        break;
      case gameLayout.playButtonTypes.buy:
        $scope.buyAccess(placeId, gameLayout);
        break;
      case gameLayout.playButtonTypes.details:
        $scope.goToPlaceDetails(placeId, eventType);
        break;
    }
  };

  $scope.pinGame = function (universeId, rootPlaceId) {
    universeId = parseInt(universeId);
    rootPlaceId = parseInt(rootPlaceId);
    let eventType = '';
    if (
      !$scope.dialogData.pinGame ||
      $scope.dialogData.pinGame.rootPlaceId !== parseInt(rootPlaceId)
    ) {
      eventType = $scope.chatLibrary.eventStreamParams.pinGameInLinkCard;
      pinGameService.sendPinGameEvent(eventType, rootPlaceId, $scope.dialogData);
      const parameters = {
        rootPlaceId,
        universeId,
        actorUsername: $scope.chatLibrary.username, //
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
      pinGameService.setPinGameData($scope.dialogData, parameters);
      pinGameService.pinGame($scope.dialogData, universeId);
      gameService.buildButtonLayoutPerConversation(
        $scope.dialogData,
        $scope.chatLibrary.placesLibrary
      );
    }
  };

  $scope.sendGameImpressionEvent = function (place) {
    if ($scope.gameImpressionSent) {
      return;
    }

    const { eventStreamParams } = $scope.chatLibrary;
    $scope.gameImpressionSent = true;
    const properties = {
      page: eventStreamParams.pageContext.linkCardInChat,
      rootPlaceIds: JSON.stringify([place.rootPlaceId]),
      universeIds: JSON.stringify([place.universeId]),
      absPositions: JSON.stringify([0]),
      sortPos: 0
    };

    eventStreamService.sendEventWithTarget(
      eventStreamParams.gameImpressions,
      eventStreamParams.actions.render,
      properties
    );
  };

  $scope.enqueueGameImpressionEvent = function (place) {
    // Use a timeout to ensure we don't send multiple events when Angular decides to
    // render the template twice in a row, which happens when you close and re-open a chat.
    // We clear the timeout on $destroy, ensuring an event is not sent for the temporarily
    // created controller. This also debounces the event in case the user is scrolling up and down rapidly.
    clearTimeout($scope.gameImpressionTimeout);
    $scope.gameImpressionTimeout = setTimeout(function () {
      $scope.sendGameImpressionEvent(place);
    }, 500);
  };

  $scope.observeGameImpressions = function (place) {
    $scope.visibilityObserver?.disconnect();
    const disconnect = elementVisibilityService.observeVisibility(
      { element: $element[0], threshold: 0.5 },
      visible => {
        if (visible) {
          $scope.enqueueGameImpressionEvent(place);
        } else {
          clearTimeout($scope.gameImpressionTimeout);
        }
      }
    );
    $scope.visibilityObserver = { disconnect };
  };

  $scope.$on('$destroy', function onDestroy() {
    $scope.visibilityObserver?.disconnect();
    clearTimeout($scope.gameImpressionTimeout);
  });
}

chatModule.controller('linkCardController', linkCardController);

export default linkCardController;
