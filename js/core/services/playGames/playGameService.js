// eslint-disable-next-line no-restricted-imports
import { uuidService } from '@rbx/core';
import { GameLauncher } from 'Roblox';
import eventStreamService from '../eventStreamService/eventStreamService';

const sendEventStream = eventStreamProperties => {
  const { eventName } = eventStreamProperties;
  const { ctx } = eventStreamProperties;
  const additionalProperties = eventStreamProperties.properties;
  eventStreamService.sendEventWithTarget(eventName, ctx, additionalProperties);
};

const sendGamePlayIntentEvent = (ctx, rootPlaceId, joinAttemptId) => {
  eventStreamService.sendGamePlayEvent(ctx, rootPlaceId, undefined, joinAttemptId);
};

const joinGameInstance = (
  placeId,
  gameInstanceId,
  joinAttemptId,
  joinAttemptOrigin,
  referredByPlayerId
) => {
  GameLauncher.joinGameInstance(
    placeId,
    gameInstanceId,
    true,
    true,
    joinAttemptId,
    joinAttemptOrigin,
    referredByPlayerId
  );
};

const followPlayer = (playerId, joinAttemptId, joinAttemptOrigin) => {
  GameLauncher.followPlayerIntoGame(playerId, joinAttemptId, joinAttemptOrigin);
};

const joinMultiPlayer = (placeId, joinAttemptId, joinAttemptOrigin, joinData) => {
  GameLauncher.joinMultiplayerGame(
    placeId,
    true,
    false,
    joinAttemptId,
    joinAttemptOrigin,
    joinData
  );
};

const joinPrivateGame = (placeId, privateServerLinkCode, joinAttemptId, joinAttemptOrigin) => {
  // accesscode as null- function just needs either linkcode or accesscode
  GameLauncher.joinPrivateGame(
    placeId,
    null,
    privateServerLinkCode,
    joinAttemptId,
    joinAttemptOrigin
  );
};

const buildPlayGameProperties = (
  rootPlaceId,
  placeId,
  gameInstanceId,
  playerId,
  privateServerLinkCode,
  referredByPlayerId,
  joinData
) => {
  return {
    rootPlaceId,
    placeId,
    gameInstanceId,
    playerId,
    privateServerLinkCode,
    referredByPlayerId,
    joinData
  };
};

const launchGame = (playGameProperties, eventStreamProperties) => {
  if (GameLauncher) {
    const joinAttemptId = GameLauncher.isJoinAttemptIdEnabled()
      ? uuidService.generateRandomUuid()
      : undefined;
    const currentESProperties = eventStreamProperties;
    if (GameLauncher.isJoinAttemptIdEnabled()) {
      currentESProperties.properties.joinAttemptId = joinAttemptId;
    }

    const { rootPlaceId } = playGameProperties;
    const { placeId } = playGameProperties;
    const { gameInstanceId } = playGameProperties;
    const { playerId } = playGameProperties;
    const { joinData } = playGameProperties;
    const { privateServerLinkCode } = playGameProperties;
    const { referredByPlayerId } = playGameProperties;
    if (placeId === rootPlaceId && gameInstanceId) {
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
        currentESProperties.gamePlayIntentEventCtx,
        referredByPlayerId
      );
    } else if (rootPlaceId && playerId) {
      currentESProperties.properties.playerId = playerId;
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(
        currentESProperties.gamePlayIntentEventCtx,
        rootPlaceId,
        joinAttemptId
      );
      followPlayer(playerId, joinAttemptId, currentESProperties.gamePlayIntentEventCtx);
    } else if (privateServerLinkCode) {
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(currentESProperties.gamePlayIntentEventCtx, placeId, joinAttemptId);
      joinPrivateGame(
        placeId,
        privateServerLinkCode,
        joinAttemptId,
        currentESProperties.gamePlayIntentEventCtx
      );
    } else {
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(currentESProperties.gamePlayIntentEventCtx, placeId, joinAttemptId);
      joinMultiPlayer(placeId, joinAttemptId, currentESProperties.gamePlayIntentEventCtx, joinData);
    }
  }
};

export default {
  buildPlayGameProperties,
  launchGame
};
