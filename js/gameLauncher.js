import $ from 'jquery';
import { uuidService } from 'core-utilities';
import AuthenticationChecker from './authenticationChecker';
import { preemptiveStartTeamCreate } from './gameLaunchHttpService';
import PrerollPlayer from './prerollPlayer';

// EventNames
const startClientAttemptedEvent = 'startClientAttempted';
const startClientFailedEvent = 'startClientFailed';
const startClientSucceededEvent = 'startClientSucceeded';
const beginInstallEvent = 'beginInstall';
const successfulInstallEvent = 'successfulInstall';
const manualDownloadEvent = 'manualDownload';

let _resolveInit;

const gameLauncher = {
  // can be overriden by win10 roblox app appHybridClientInterface.js
  gameLaunchInterface: null,
  gameLaunchLogger: null,
  initialized: new Promise((resolve, reject) => {
    _resolveInit = resolve;
  })
};

function isJoinAttemptIdEnabled() {
  return gameLauncher.gameLaunchInterface?.isJoinAttemptIdEnabled;
}

function generateGameLaunchParams(originalParams, joinAttemptId, joinAttemptOrigin) {
  const params = {
    ...originalParams,
    joinAttemptId: joinAttemptId ?? uuidService.generateRandomUuid(),
  };

  if (joinAttemptOrigin) {
    params.joinAttemptOrigin = joinAttemptOrigin;
  }

  return params;
}

function setGameLaunchInterface(newInterface) {
  gameLauncher.gameLaunchInterface = newInterface;
  _resolveInit();
}

function setGameLaunchLogger(newLogger) {
  gameLauncher.gameLaunchLogger = newLogger;
}

function editGameInStudio(
  placeId,
  universeId,
  allowUpload,
  isTeamCreateEnabled = false,
  enableTeamCreatePreemptiveStart = false
) {
  if (isTeamCreateEnabled && enableTeamCreatePreemptiveStart) {
    preemptiveStartTeamCreate(placeId);
  }
  gameLauncher.gameLaunchInterface.editGameInStudio(placeId, universeId, allowUpload);
}

function openStudio() {
  gameLauncher.gameLaunchInterface.openStudio();
}

function tryAssetInStudio(assetId) {
  gameLauncher.gameLaunchInterface.tryAssetInStudio(assetId);
}

function openPluginInStudio(pluginId) {
  gameLauncher.gameLaunchInterface.openPluginInStudio(pluginId);
}

function joinMultiplayerGame(
  placeId,
  isMembershipLevelOk = true,
  isPlayTogetherGame,
  joinAttemptId,
  joinAttemptOrigin,
  joinData,
) {
  let params = { 
    placeId,
    launchData: joinData?.launchData,
    eventId: joinData?.eventId,
    isPlayTogetherGame: isPlayTogetherGame === true,
  };

  if (gameLauncher.gameLaunchInterface.isJoinAttemptIdEnabled) {
    params = generateGameLaunchParams(params, joinAttemptId, joinAttemptOrigin);
  }

  const deferred = AuthenticationChecker.restrictGuests(params)
    .then(PrerollPlayer.waitForPreroll)
    .then(gameLauncher.gameLaunchInterface.joinMultiplayerGame);
  return deferred;
}

function followPlayerIntoGame(userId, joinAttemptId, joinAttemptOrigin) {
  let params = { userId };

  if (gameLauncher.gameLaunchInterface.isJoinAttemptIdEnabled) {
    params = generateGameLaunchParams(params, joinAttemptId, joinAttemptOrigin);
  }

  const deferred = AuthenticationChecker.restrictGuests(params)
    .then(PrerollPlayer.waitForPreroll)
    .then(gameLauncher.gameLaunchInterface.followPlayerIntoGame);
  return deferred;
}

function joinGameInstance(
  placeId,
  gameId,
  isMembershipLevelOk,
  isPlayTogetherGame,
  joinAttemptId,
  joinAttemptOrigin,
  referredByPlayerId
) {
  let params = {
    placeId,
    gameId,
    isPlayTogetherGame: isPlayTogetherGame === true,
    referredByPlayerId
  };

  if (gameLauncher.gameLaunchInterface.isJoinAttemptIdEnabled) {
    params = generateGameLaunchParams(params, joinAttemptId, joinAttemptOrigin);
  }

  const deferred = AuthenticationChecker.restrictGuests(params)
    .then(PrerollPlayer.waitForPreroll)
    .then(gameLauncher.gameLaunchInterface.joinGameInstance);
  return deferred;
}

async function joinPrivateGame(
  placeId,
  accessCode,
  linkCode,
  joinAttemptId,
  joinAttemptOrigin
) {
  await gameLauncher.initialized;
  let params = {
    placeId,
    accessCode,
    linkCode
  };

  if (gameLauncher.gameLaunchInterface.isJoinAttemptIdEnabled) {
    params = generateGameLaunchParams(params, joinAttemptId, joinAttemptOrigin);
  }

  const deferred = PrerollPlayer.waitForPreroll(params).then(
    gameLauncher.gameLaunchInterface.joinPrivateGame
  );
  return deferred;
}

function playTogetherGame(placeId, conversationId, joinAttemptId, joinAttemptOrigin) {
  let params = { placeId, conversationId };

  if (gameLauncher.gameLaunchInterface.isJoinAttemptIdEnabled) {
    params = generateGameLaunchParams(params, joinAttemptId, joinAttemptOrigin);
  }

  const deferred = AuthenticationChecker.restrictGuests(params)
    .then(PrerollPlayer.waitForPreroll)
    .then(gameLauncher.gameLaunchInterface.playTogetherGame);
  return deferred;
}

// jQuery plugin for binding game launch buttons.  Finds any protocol handler game launch buttons in the current jQuery object and binds them.
// eg: $("#ajaxUpdatedContainer").bindGameLaunch();
$.fn.bindGameLaunch = function bindGameLaunch() {
  this.find('.VisitButtonPlayGLI').click(function() {
    const el = $(this);
    const placeId = el.attr('placeid');
    const isMembershipLevelOk = el.data('is-membership-level-ok');
    joinMultiplayerGame(placeId, isMembershipLevelOk);
  });

  this.find('.VisitButtonEditGLI').click(function() {
    const el = $(this);
    const placeId = el.attr('placeid');
    const universeId = el.data('universeid');
    const allowUpload = !!el.data('allowupload');
    editGameInStudio(placeId, universeId, allowUpload);
  });

  return this;
};

$(document).ready(() => {
  // ---------- VisitButtons bindings: --------------
  $('body').bindGameLaunch();
});

Object.assign(gameLauncher, {
  // implementations of objects, set by implementers at page load
  authenticationChecker: AuthenticationChecker,
  prerollPlayer: PrerollPlayer,

  // Functions
  joinMultiplayerGame,
  openStudio,
  openPluginInStudio,
  editGameInStudio,
  followPlayerIntoGame,
  joinGameInstance,
  joinPrivateGame,
  playTogetherGame,
  setGameLaunchInterface,
  setGameLaunchLogger,
  tryAssetInStudio,
  isJoinAttemptIdEnabled,

  // EventNames
  startClientAttemptedEvent,
  startClientFailedEvent,
  startClientSucceededEvent,
  beginInstallEvent,
  successfulInstallEvent,
  manualDownloadEvent
});

export default gameLauncher;
