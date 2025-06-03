import $ from 'jquery';
import { DeviceMeta } from 'Roblox';
import AppHybridClientInterface from './win10/appHybridClientInterface';
import AuthenticationChecker from './authenticationChecker';
import GameLauncher from './gameLauncher';
import GameLaunchLogger from './gameLaunchLogger';
import GamePlayEvents from './gamePlayEvents';
import GamePlayEventsHandlers from './gamePlayEventsHandlers';
import PrerollPlayer from './prerollPlayer';
import VideoPreRollDFP from './videoPreRollDFP';
import ProtocolHandlerClientInterface from './react/protocolHandlerClientInterface';
import PlayButton from '../ts/react/playButton/playButtonEntry';
import '../css/gameLaunch/gameLaunch.scss';

// shim all the things that are available globally for backwards compatibility;
if (!window.Roblox) {
  window.Roblox = {};
}

Object.assign(window.Roblox, {
  AuthenticationChecker,
  GameLauncher,
  GameLaunchLogger,
  GamePlayEvents,
  PrerollPlayer,
  ProtocolHandlerClientInterface,
  VideoPreRollDFP,
  PlayButton
});

$(document).ready(() => {
  GamePlayEventsHandlers();
  const device = DeviceMeta();
  if (device.isUWPApp || device.isUniversalApp) {
    const placeLauncherPanel = $('#PlaceLauncherStatusPanel');
    AppHybridClientInterface.isJoinAttemptIdEnabled =
      (placeLauncherPanel.data('is-join-attempt-id-enabled') ?? 'False') === 'True';
    window.Roblox.AppHybridClientInterface = AppHybridClientInterface;
    GameLauncher.setGameLaunchInterface(AppHybridClientInterface);
  }
  GameLauncher.setGameLaunchLogger(GameLaunchLogger);
});
