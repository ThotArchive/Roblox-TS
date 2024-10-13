import { Cookies, Hybrid } from 'Roblox';
import $ from 'jquery';

function startGame(gameLaunchParams) {
  const deferred = new $.Deferred();
  Hybrid.Game.launchGame(gameLaunchParams, () => {
    deferred.resolve(gameLaunchParams);
  });
  return deferred;
}

// placeLauncherParams has placeId, genderId, isPlayTogetherGame
function joinMultiplayerGame(placeLauncherParams) {
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const gameLaunchParams = {
    requestType: Hybrid.Game.LAUNCH_MODES.SIMPLE_GAME,
    placeId: placeLauncherParams.placeId.toString(),
    isPlayTogetherGame,
    browserTrackerId: Cookies.getBrowserTrackerId()
  };

  if (placeLauncherParams.joinAttemptId) {
    gameLaunchParams.joinAttemptId = placeLauncherParams.joinAttemptId;
  }

  if (placeLauncherParams.joinAttemptOrigin) {
    gameLaunchParams.joinAttemptOrigin = placeLauncherParams.joinAttemptOrigin;
  }

  return startGame(gameLaunchParams);
}

// placeLauncherParams has userId, genderId (though genderId might be ignored)
function followPlayerIntoGame(placeLauncherParams) {
  const gameLaunchParams = {
    requestType: Hybrid.Game.LAUNCH_MODES.FOLLOW_USER,
    userId: placeLauncherParams.userId.toString(),
    browserTrackerId: Cookies.getBrowserTrackerId()
  };

  if (placeLauncherParams.joinAttemptId) {
    gameLaunchParams.joinAttemptId = placeLauncherParams.joinAttemptId;
  }

  if (placeLauncherParams.joinAttemptOrigin) {
    gameLaunchParams.joinAttemptOrigin = placeLauncherParams.joinAttemptOrigin;
  }

  return startGame(gameLaunchParams);
}

// placeLauncherParams has placeId, gameId, genderId, isPlayTogetherGame
function joinGameInstance(placeLauncherParams) {
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const gameLaunchParams = {
    requestType: Hybrid.Game.LAUNCH_MODES.GAME_INSTANCE,
    placeId: placeLauncherParams.placeId.toString(),
    instanceId: placeLauncherParams.gameId,
    isPlayTogetherGame,
    browserTrackerId: Cookies.getBrowserTrackerId()
  };

  if (placeLauncherParams.joinAttemptId) {
    gameLaunchParams.joinAttemptId = placeLauncherParams.joinAttemptId;
  }

  if (placeLauncherParams.joinAttemptOrigin) {
    gameLaunchParams.joinAttemptOrigin = placeLauncherParams.joinAttemptOrigin;
  }

  return startGame(gameLaunchParams);
}

// placeLauncherParams has placeId, accessCode
function joinPrivateGame(placeLauncherParams) {
  const gameLaunchParams = {
    requestType: Hybrid.Game.LAUNCH_MODES.PRIVATE_SERVER,
    placeId: placeLauncherParams.placeId.toString(),
    accessCode: placeLauncherParams.accessCode,
    browserTrackerId: Cookies.getBrowserTrackerId()
  };

  if (placeLauncherParams.joinAttemptId) {
    gameLaunchParams.joinAttemptId = placeLauncherParams.joinAttemptId;
  }

  if (placeLauncherParams.joinAttemptOrigin) {
    gameLaunchParams.joinAttemptOrigin = placeLauncherParams.joinAttemptOrigin;
  }

  return startGame(gameLaunchParams);
}

// placeLauncherParams has placeId, conversationId
function playTogetherGame(placeLauncherParams) {
  const gameLaunchParams = {
    requestType: Hybrid.Game.LAUNCH_MODES.SIMPLE_GAME,
    placeId: placeLauncherParams.placeId.toString(),
    conversationId: placeLauncherParams.conversationId.toString(),
    browserTrackerId: Cookies.getBrowserTrackerId()
  };

  if (placeLauncherParams.joinAttemptId) {
    gameLaunchParams.joinAttemptId = placeLauncherParams.joinAttemptId;
  }

  if (placeLauncherParams.joinAttemptOrigin) {
    gameLaunchParams.joinAttemptOrigin = placeLauncherParams.joinAttemptOrigin;
  }

  return startGame(gameLaunchParams);
}

// shim this under Roblox later.
const AppHybridClientInterface = {
  isJoinAttemptIdEnabled: false,
  joinMultiplayerGame,
  followPlayerIntoGame,
  joinGameInstance,
  joinPrivateGame,
  playTogetherGame
};

export default AppHybridClientInterface;
