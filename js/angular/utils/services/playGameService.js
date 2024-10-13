// eslint-disable-next-line no-restricted-imports
import { uuidService } from '@rbx/core';
import { GameLauncher } from 'Roblox';
import angularJsUtilitiesModule from '../angularJsUtilitiesModule';

function playGameService($log, eventStreamService) {
  'ngInject';

  function sendEventStream(eventStreamProperties) {
    const { eventName, ctx } = eventStreamProperties;
    const additionalProperties = eventStreamProperties.properties;
    eventStreamService.sendEventWithTarget(eventName, ctx, additionalProperties);
  }

  function sendGamePlayIntentEvent(ctx, rootPlaceId, joinAttemptId) {
    eventStreamService.sendGamePlayEvent(ctx, rootPlaceId, undefined, joinAttemptId);
  }

  function joinGameInstance(placeId, gameInstanceId, joinAttemptId, joinAttemptOrigin) {
    GameLauncher.joinGameInstance(
      placeId,
      gameInstanceId,
      true,
      true,
      joinAttemptId,
      joinAttemptOrigin
    );
  }

  function followPlayer(playerId, joinAttemptId, joinAttemptOrigin) {
    GameLauncher.followPlayerIntoGame(playerId, joinAttemptId, joinAttemptOrigin);
  }

  function joinMultiPlayer(placeId, joinAttemptId, joinAttemptOrigin) {
    GameLauncher.joinMultiplayerGame(placeId, true, false, joinAttemptId, joinAttemptOrigin);
  }

  function joinPrivateGame(placeId, privateServerLinkCode, joinAttemptId, joinAttemptOrigin) {
    // accesscode as null- function just needs either linkcode or accesscode
    GameLauncher.joinPrivateGame(
      placeId,
      null,
      privateServerLinkCode,
      joinAttemptId,
      joinAttemptOrigin
    );
  }
  return {
    launchGame(playGameProperties, eventStreamProperties) {
      if (GameLauncher) {
        const joinAttemptId = GameLauncher.isJoinAttemptIdEnabled()
          ? uuidService.generateRandomUuid()
          : undefined;
        const currentESProperties = eventStreamProperties;
        if (GameLauncher.isJoinAttemptIdEnabled()) {
          currentESProperties.properties.joinAttemptId = joinAttemptId;
        }

        const {
          rootPlaceId,
          placeId,
          gameInstanceId,
          playerId,
          privateServerLinkCode
        } = playGameProperties;
        if (rootPlaceId && playerId) {
          currentESProperties.properties.playerId = playerId;
          sendEventStream(currentESProperties);
          sendGamePlayIntentEvent(
            currentESProperties.gamePlayIntentEventCtx,
            rootPlaceId,
            joinAttemptId
          );
          followPlayer(playerId, joinAttemptId, currentESProperties.gamePlayIntentEventCtx);
        } else if (placeId === rootPlaceId && gameInstanceId) {
          currentESProperties.properties.gameInstanceId = gameInstanceId;
          sendEventStream(currentESProperties);
          sendGamePlayIntentEvent(
            currentESProperties.gamePlayIntentEventCtx,
            rootPlaceId,
            joinAttemptId
          );
          joinGameInstance(
            placeId,
            gameInstanceId,
            joinAttemptId,
            currentESProperties.gamePlayIntentEventCtx
          );
        } else if (privateServerLinkCode) {
          sendEventStream(currentESProperties);
          sendGamePlayIntentEvent(
            currentESProperties.gamePlayIntentEventCtx,
            placeId,
            joinAttemptId
          );
          joinPrivateGame(
            placeId,
            privateServerLinkCode,
            joinAttemptId,
            currentESProperties.gamePlayIntentEventCtx
          );
        } else {
          sendEventStream(currentESProperties);
          sendGamePlayIntentEvent(
            currentESProperties.gamePlayIntentEventCtx,
            placeId,
            joinAttemptId
          );
          joinMultiPlayer(placeId, joinAttemptId, currentESProperties.gamePlayIntentEventCtx);
        }
      }
    },

    buildPlayGameProperties(rootPlaceId, placeId, gameInstanceId, playerId, privateServerLinkCode) {
      return {
        rootPlaceId,
        placeId,
        gameInstanceId,
        playerId,
        privateServerLinkCode
      };
    }
  };
}

angularJsUtilitiesModule.factory('playGameService', playGameService);

export default playGameService;
