/* eslint-disable func-names */
/* eslint-disable prefer-const */
// Please note: This file depends on RobloxCookies.js being already loaded.
import {
  Cookies,
  CurrentUser,
  Dialog,
  Endpoints,
  EnvironmentUrls,
  TranslationResourceProvider,
  PlaceLauncher,
  ExperimentationService,
  DeviceMeta
} from 'Roblox';
import React, { useCallback, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getCurrentBrowser } from 'core-utilities';
import { TranslationProvider, WebBloxProvider } from 'react-utilities';
import $ from 'jquery';
import GameLauncher from '../gameLauncher';
import { getDeferredDeeplinkQueryParams } from '../../ts/deferredDeeplinks/deferredDeeplinkUtilities';
import {
  NewLoadingDialog,
  NewDownloadDialog,
  NewInstallDialog
} from './downloadDiaglog/components/NewDialogs';
import translationConfig from './downloadDiaglog/constants/translation.config';

let experimentVariantCache = null;
let experimentPromise = null;

const ProtocolHandlerClientInterface = {
  isInstalling: false,
  statusInterval: 0,
  robloxLocale: '',
  gameLocale: '',
  protocolUrlSeparator: '+',
  protocolUrlIncludesLaunchTime: false,
  protocolDetectionEnabled: false,
  avatarParamEnabled: true,
  separateScriptParamsEnabled: false,
  waitTimeBeforeFailure: 300,
  protocolNameForStudio: 'roblox-studio',
  protocolNameForClient: 'roblox-client',
  logger: null,
  channel: '',
  studioChannel: '',
  playerChannel: '',
  isDuarAutoOptInEnabled: false,
  isDuarOptOutDisabled: false,
  isJoinAttemptIdEnabled: false
};

const distributorTypes = {
  Global: 'Global'
};

const launchModes = {
  edit: 'edit',
  plugin: 'plugin',
  play: 'play',
  build: 'build',
  app: 'app',
  asset: 'asset'
};

function isStudioMode(launchMode) {
  return (
    launchMode === launchModes.edit ||
    launchMode === launchModes.plugin ||
    launchMode === launchModes.asset
  );
}

const ShowNewStartingDialog = () => {
  const [isVisible, setVisible] = useState(true);
  const onClose = useCallback(() => setVisible(false), []);
  return (
    <WebBloxProvider>
      <TranslationProvider config={translationConfig}>
        <NewLoadingDialog isOpen={isVisible} onClose={onClose} />
      </TranslationProvider>
    </WebBloxProvider>
  );
};

function getDialogContainer() {
  const id = 'react-dialog-container';
  let container = document.getElementById(id);
  if (container) {
    container.innerHTML = '';
  } else {
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
  }
  return container;
}

function showStartingDialog(onClose, launchMode, showNewDialog = false) {
  const refactorEnabled = PlaceLauncher.Resources.RefactorEnabled === 'True';
  const studioMode = isStudioMode(launchMode);

  // use Roblox dialog modal
  if (refactorEnabled) {
    if (showNewDialog) {
      const container = getDialogContainer();
      ReactDOM.render(<ShowNewStartingDialog />, container);
      return;
    }
    const bodyContent = studioMode
      ? PlaceLauncher.Resources.ProtocolHandlerStartingDialog.studio.content
      : PlaceLauncher.Resources.ProtocolHandlerStartingDialog.play.content;
    const { loader } = PlaceLauncher.Resources.ProtocolHandlerStartingDialog;
    Dialog.open({
      bodyContent: bodyContent + loader,
      allowHtmlContentInBody: true,
      showAccept: false,
      showDecline: false,
      dismissable: false,
      cssClass: 'protocolhandler-starting-modal',
      onCloseCallback: onClose,
      onCancel() {
        onClose();
        $.modal.close();
      }
    });

    return;
  }

  if (studioMode) {
    $('.protocol-handler-container').each(function () {
      $(this).find('.play-modal').addClass('hidden');
      $(this).find('.studio-modal').removeClass('hidden');
    });
  } else {
    $('.protocol-handler-container').each(function () {
      $(this).find('.play-modal').removeClass('hidden');
      $(this).find('.studio-modal').addClass('hidden');
    });
  }

  $('#ProtocolHandlerStartingDialog').modal({
    escClose: true,
    opacity: 80,
    overlayCss: {
      backgroundColor: '#000'
    },
    onClose() {
      onClose();
      $.modal.close();
    },
    zIndex: 1031
  });
}

function preloadExperimentVariant() {
  if (!experimentPromise) {
    const layerName = 'Website.DownloadFlow';
    const result = ExperimentationService.getAllValuesForLayer(layerName);

    if (!result || typeof result.then !== 'function') {
      experimentPromise = Promise.resolve(null);
      return experimentPromise;
    }

    experimentPromise = result.then(layer => {
      if (layer) {
        ExperimentationService.logLayerExposure(layerName);
      }
      experimentVariantCache = layer?.showNewInstruction === true;
      const isDesktop = DeviceMeta ? DeviceMeta().isDesktop : false;
      return experimentVariantCache && isDesktop;
    });
  }
  return experimentPromise;
}

function getExperimentVariant(callback) {
  if (experimentVariantCache !== null) {
    callback(experimentVariantCache);
  } else {
    preloadExperimentVariant().then(value => {
      callback(value);
    });
  }
}

function showDialog(onClose, gameLaunchParams) {
  getExperimentVariant(showNewDialog => {
    let showAreYouInstalledDialogTimeout;
    const myOnClose = () => {
      clearTimeout(showAreYouInstalledDialogTimeout);
      onClose();
    };

    showAreYouInstalledDialogTimeout = setTimeout(() => {
      $.modal.close();
      // adding eslint disable below because the function definition placements is too complicated in this big file. Will fix later
      // eslint-disable-next-line no-use-before-define
      showAreYouInstalledDialog(myOnClose, gameLaunchParams, showNewDialog);
    }, 5000);

    showStartingDialog(myOnClose, gameLaunchParams.launchMode, showNewDialog);
  });
}

function showLaunchFailureDialog() {
  $.modal.close();

  const translationProvider = new TranslationResourceProvider();
  const visitGameResources = translationProvider.getTranslationResource('Common.VisitGame');
  const controlsResources = translationProvider.getTranslationResource('CommonUI.Controls');
  Dialog.open({
    titleText: visitGameResources.get('Heading.ErrorStartingGame'),
    bodyContent: visitGameResources.get('Response.Dialog.ErrorLaunching'),
    acceptText: controlsResources.get('Action.OK') || 'OK',
    showDecline: false
  });
}

function waitForStatus(gameLaunchParams) {
  const deferred = new $.Deferred();
  clearInterval(ProtocolHandlerClientInterface.statusInterval);
  ProtocolHandlerClientInterface.statusInterval = setInterval(() => {
    const url = `${EnvironmentUrls.matchmakingApi}/v1/client-status`;
    $.ajax({
      method: 'GET',
      url,
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      success(response) {
        if (response?.status !== 'Unknown') {
          deferred.resolve(gameLaunchParams);
          clearInterval(ProtocolHandlerClientInterface.statusInterval);
        }
      }
    });
  }, 3000);
  return deferred;
}

function cleanUpAndLogSuccess(gameLaunchParams) {
  // hide dialog
  $.modal.close();

  // Log success!
  const logParams = {
    launchMethod: 'Protocol',
    params: gameLaunchParams
  };
  $(GameLauncher).trigger(GameLauncher.startClientSucceededEvent, logParams);
  if (ProtocolHandlerClientInterface.isInstalling) {
    $(GameLauncher).trigger(GameLauncher.successfulInstallEvent, logParams);
    ProtocolHandlerClientInterface.isInstalling = false;
  }
}

// eslint-disable-next-line no-unused-vars
function cleanUpAndLogFailure(gameLaunchParams) {
  // err.
  // TODO: ???
  return false;
}

function resetClientStatus() {
  const url = `${EnvironmentUrls.matchmakingApi}/v1/client-status`;
  const body = {
    status: 'Unknown'
  };

  return $.ajax({
    method: 'POST',
    url,
    contentType: 'application/json',
    data: body,
    dataType: 'json'
  })?.success;
}

function getClientAssertionEnabled() {
  let guacUrl = `${EnvironmentUrls.apiGatewayUrl}/universal-app-configuration/v1/behaviors/auth-ticket-client-assertion/content`;
  return $.ajax({
    method: 'GET',
    url: guacUrl,
    contentType: 'application/json',
    timeout: 10000
  }).then(
    function (guacResponse) {
      return Boolean(guacResponse && guacResponse.isClientAssertionEnabled === 'true');
    },
    function () {
      return false;
    }
  );
}

function doClientAssertionRequest() {
  let authUrl = `${EnvironmentUrls.authApi}/v1/client-assertion/`;

  return $.ajax({
    method: 'GET',
    url: authUrl,
    contentType: 'application/json',
    timeout: 10000
  });
}

function doAuthTicketRequest(clientAssertion) {
  let authUrl = `${EnvironmentUrls.authApi}/v1/authentication-ticket/`;

  return $.ajax({
    method: 'POST',
    url: authUrl,
    data: JSON.stringify({
      clientAssertion
    }),
    contentType: 'application/json'
  });
}

function getAuthTicket(gameLaunchDefaultParams) {
  let deferred = new $.Deferred();
  const { launchMode } = gameLaunchDefaultParams;
  const studioMode = isStudioMode(launchMode);
  let gameLaunchParams = { ...gameLaunchDefaultParams };

  if (!CurrentUser.isAuthenticated || studioMode) {
    deferred.resolve(gameLaunchParams);
    return deferred;
  }

  function AuthTicketFlow(clientAssertion) {
    return ProtocolHandlerClientInterface.doAuthTicketRequest(clientAssertion).then(function (
      data,
      textStatus,
      xhr
    ) {
      const authenticationTicket = xhr.getResponseHeader('RBX-Authentication-Ticket');
      if (authenticationTicket && authenticationTicket.length > 0) {
        gameLaunchParams.gameInfo = authenticationTicket;
        deferred.resolve(gameLaunchParams);
      } else {
        deferred.reject();
      }
      return deferred;
    });
  }

  function AuthTicketFlowWithClientAssertion() {
    return ProtocolHandlerClientInterface.doClientAssertionRequest().then(
      function (clientAssertionData) {
        return AuthTicketFlow(clientAssertionData.clientAssertion);
      },
      function () {
        return AuthTicketFlow();
      }
    );
  }

  return ProtocolHandlerClientInterface.getClientAssertionEnabled().then(
    function (isEnabled) {
      if (isEnabled) {
        return AuthTicketFlowWithClientAssertion();
      }
      return AuthTicketFlow();
    },
    function () {
      return AuthTicketFlow();
    }
  );
}

function setLocationHref(href) {
  if (
    ProtocolHandlerClientInterface.protocolDetectionEnabled &&
    typeof navigator.msLaunchUri !== 'undefined'
  ) {
    navigator.msLaunchUri(
      href,
      () => {},
      () => {}
    ); // swallow errors
  } else {
    let iframe = $('iframe#gamelaunch');
    if (iframe.length > 0) {
      iframe.remove();
    }

    iframe = $("<iframe id='gamelaunch' class='hidden'></iframe>").attr('src', href);
    $('body').append(iframe);
    // for selenium
    const seleniumEvent = new Event('ProtocolLaunchStartSelenium');
    window.dispatchEvent(seleniumEvent);
  }
}

function launchProtocolUrl(gameLaunchParams) {
  const deferred = new $.Deferred();
  const { launchMode } = gameLaunchParams;
  const studioMode = isStudioMode(launchMode);
  const urlSeparator = ProtocolHandlerClientInterface.protocolUrlSeparator;
  let gameLaunchUrl = `${gameLaunchParams.protocolName}:`;
  const urlComponents = [];

  urlComponents.push(1); // protocol version parameter - used if we wish to significantly change the structure of the protocol url
  urlComponents.push(`launchmode:${gameLaunchParams.launchMode}`);

  // Studio will freeze at log-in if passed a guest ticket
  if (
    gameLaunchParams.gameInfo &&
    (gameLaunchParams.protocolName !== ProtocolHandlerClientInterface.protocolNameForStudio ||
      gameLaunchParams.gameInfo.indexOf('Guest:') !== 0)
  ) {
    urlComponents.push(`gameinfo:${encodeURIComponent(gameLaunchParams.gameInfo)}`);
  }

  if (ProtocolHandlerClientInterface.protocolUrlIncludesLaunchTime) {
    urlComponents.push(`launchtime:${gameLaunchParams.launchTime}`);
  }

  if (PlaceLauncher.Resources.IsProtocolHandlerBaseUrlParamEnabled === 'True') {
    const baseUrl = EnvironmentUrls.websiteUrl || `https://${window.location.host}`;
    urlComponents.push(`baseUrl:${encodeURIComponent(baseUrl)}`);
  }

  if (studioMode && CurrentUser.isAuthenticated) {
    urlComponents.push(`distributorType:${distributorTypes.Global}`);
    urlComponents.push(`userId:${CurrentUser.userId}`);
  }

  if (studioMode) {
    urlComponents.push(`browser:${getCurrentBrowser()}`);
  }

  $.each(gameLaunchParams.otherParams, (name, value) => {
    if (name === value) {
      // assume if name === value, just add name
      urlComponents.push(name);
    } else {
      urlComponents.push(`${name}:${encodeURIComponent(value)}`);
    }
  });

  gameLaunchUrl += urlComponents.join(urlSeparator);
  if (GameLauncher.gameLaunchLogger) {
    GameLauncher.gameLaunchLogger.logToConsole(
      `launchProtocolUrl: ${JSON.stringify({
        url: gameLaunchUrl,
        params: gameLaunchParams
      })}`
    );
  }
  // setLocationHref is used so that automated tests can intercept the protocol handler URL for verification.  Do not refactor without checking the tests.
  setLocationHref(gameLaunchUrl);

  deferred.resolve(gameLaunchParams);
  return deferred;
}

function startGameFlow(gameLaunchParams) {
  return $.when(getAuthTicket(gameLaunchParams), resetClientStatus())
    .then(launchProtocolUrl, showLaunchFailureDialog)
    .then(waitForStatus)
    .then(cleanUpAndLogSuccess, cleanUpAndLogFailure);
}

function continueInstallClick(e) {
  const clickedElement = $(this);
  if (!clickedElement.hasClass('disabled')) {
    startGameFlow(e.data);
    const protocolHandlerAlwaysAllowElem = $('#ProtocolHandlerClickAlwaysAllowed');
    if (typeof protocolHandlerAlwaysAllowElem.data('hideRememberOverlay') === 'undefined') {
      // if the attribute is not set, we should show the element.
      protocolHandlerAlwaysAllowElem.show();
    }
  }

  return false;
}

function startGame(gameLaunchDefaultParams) {
  const gameLaunchParams = { ...gameLaunchDefaultParams };
  gameLaunchParams.launchTime = new Date().getTime();
  gameLaunchParams.otherParams.browsertrackerid = Cookies.getBrowserTrackerId();

  gameLaunchParams.otherParams.robloxLocale = ProtocolHandlerClientInterface.robloxLocale;
  gameLaunchParams.otherParams.gameLocale = ProtocolHandlerClientInterface.gameLocale;
  gameLaunchParams.otherParams.channel = ProtocolHandlerClientInterface.channel;

  if (gameLaunchParams.protocolName === ProtocolHandlerClientInterface.protocolNameForStudio) {
    gameLaunchParams.otherParams.channel = ProtocolHandlerClientInterface.studioChannel;
  } else {
    gameLaunchParams.otherParams.channel = ProtocolHandlerClientInterface.playerChannel;
  }

  if (
    ProtocolHandlerClientInterface.isDuarAutoOptInEnabled &&
    gameLaunchParams.protocolName === ProtocolHandlerClientInterface.protocolNameForClient &&
    !gameLaunchParams.otherParams.LaunchExp
  ) {
    if (ProtocolHandlerClientInterface.isDuarOptOutDisabled) {
      gameLaunchParams.otherParams.LaunchExp = 'InApp';
    } else {
      gameLaunchParams.otherParams.LaunchExp = 'PreferInApp';
    }
  }

  // fire startClientAttempted
  $(GameLauncher).trigger(GameLauncher.startClientAttemptedEvent, {
    launchMethod: 'Protocol',
    params: gameLaunchParams
  });
  showDialog(() => {}, gameLaunchParams);
  // return the deferred object so we can continue chaining, if desired.
  return startGameFlow(gameLaunchParams);
}

function startGameWithDeepLinkUrl(deepLinkUrl, placeId) {
  const gameLaunchParams = {
    launchMode: 'play',
    protocolName: ProtocolHandlerClientInterface.protocolNameForClient,
    placeId
  };
  showDialog(() => {}, gameLaunchParams);
  setLocationHref(deepLinkUrl);
  setTimeout(() => {
    // hide dialog after a minute
    $.modal.close();
  }, 60000);
}

function openDesktopUniversalApp() {
  const DUALaunchParams = {};
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;
  DUALaunchParams.protocolName = protocol;
  DUALaunchParams.launchTime = new Date().getTime();
  DUALaunchParams.launchMode = launchModes.app;
  DUALaunchParams.otherParams = {};
  DUALaunchParams.otherParams.browsertrackerid = Cookies.getBrowserTrackerId();
  DUALaunchParams.otherParams.robloxLocale = ProtocolHandlerClientInterface.robloxLocale;
  DUALaunchParams.otherParams.gameLocale = ProtocolHandlerClientInterface.gameLocale;
  DUALaunchParams.otherParams.LaunchExp = 'InApp';

  // fire startClientAttempted
  $(GameLauncher).trigger(GameLauncher.startClientAttemptedEvent, {
    launchMethod: 'Protocol',
    params: DUALaunchParams
  });
  showDialog(() => {}, DUALaunchParams);
  // return the deferred object so we can continue chaining, if desired.
  return startGameFlow(DUALaunchParams);
}

function getPlaceLauncherUrl(requestType, otherParams) {
  let absoluteUrl = ' ';
  if (Endpoints && Endpoints.Urls) {
    absoluteUrl = `${Endpoints.getAbsoluteUrl('/Game/PlaceLauncher.ashx')}?`;
  }

  // if endpoints are turned off, or if the absolute url resolver returns a relative path, fallback on the old method
  if (absoluteUrl[0] !== 'h') {
    const domainUrl = `http://${window.location.host}`;
    const domainPath = '/Game/PlaceLauncher.ashx?';
    absoluteUrl = domainUrl + domainPath;
  }
  absoluteUrl = absoluteUrl.replace('placelauncher', 'PlaceLauncher');

  const args = {
    request: requestType,
    browserTrackerId: Cookies.getBrowserTrackerId()
  };
  $.extend(args, otherParams);
  return absoluteUrl + $.param(args);
}

function getStudioScriptUrl(scriptHandlerName, placeId, universeId, allowUpload) {
  let absoluteUrl = ' ';
  if (Endpoints && Endpoints.Urls) {
    absoluteUrl = `${Endpoints.getAbsoluteUrl(`/Game/${scriptHandlerName}`)}?`;
  }

  // if endpoints are turned off, or if the absolute url resolver returns a relative path, fallback on the old method
  if (absoluteUrl[0] !== 'h') {
    const domainUrl = `http://${window.location.host}`;
    const domainPath = `/Game/${scriptHandlerName}?`;
    absoluteUrl = domainUrl + domainPath;
  }

  const args = {
    placeId,
    upload: allowUpload ? placeId : '',
    universeId,
    testMode: false
  };
  return absoluteUrl + $.param(args);
}

function getEditScriptUrl(placeId, universeId, allowUpload) {
  return getStudioScriptUrl('Edit.ashx', placeId, universeId, allowUpload);
}

function openStudio() {
  const otherParams = {};

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = 'avatar';
  }

  return startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: 'edit',
    otherParams
  });
}

function tryAssetInStudio(assetId) {
  const otherParams = {
    assetid: assetId
  };

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = 'avatar';
  }

  return startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: 'asset',
    otherParams
  });
}

function openPluginInStudio(pluginId) {
  const otherParams = {
    pluginid: pluginId
  };

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = 'avatar';
  }

  startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: 'plugin',
    otherParams
  });
}

function editGameInStudio(placeId, universeId, allowUpload) {
  let otherParams;
  if (ProtocolHandlerClientInterface.separateScriptParamsEnabled) {
    otherParams = {
      task: 'EditPlace',
      placeId,
      universeId
    };
  } else {
    const scriptUrl = getEditScriptUrl(placeId, universeId, allowUpload);
    otherParams = {
      script: scriptUrl
    };
  }

  if (ProtocolHandlerClientInterface.avatarParamEnabled) {
    otherParams.avatar = 'avatar';
  }

  // we currently always pass "avatar" to studio, but in the future it may need to be optional
  startGame({
    protocolName: ProtocolHandlerClientInterface.protocolNameForStudio,
    launchMode: 'edit',
    otherParams,
    placeId
  });
}

// placeLauncherParams has placeId, isPlayTogetherGame, joinAttemptId, joinAttemptOrigin, launchData, eventId
function joinMultiplayerGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = 'play';
  const placeLauncherUrl = getPlaceLauncherUrl('RequestGame', placeLauncherParams);
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const otherParams = {
    placelauncherurl: placeLauncherUrl
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams,
    placeId: placeLauncherParams.placeId,
    isPlayTogetherGame,
    launchData: placeLauncherParams.launchData,
    eventId: placeLauncherParams.eventId
  };

  return startGame(startGameParams);
}

// placeLauncherParams has userId, joinAttemptId, joinAttemptOrigin
function followPlayerIntoGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = 'play';
  const placeLauncherUrl = getPlaceLauncherUrl('RequestFollowUser', placeLauncherParams);
  const params = {
    placelauncherurl: placeLauncherUrl
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, gameId, isPlayTogetherGame, joinAttemptId, joinAttemptOrigin
function joinGameInstance(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = 'play';
  const placeLauncherUrl = getPlaceLauncherUrl('RequestGameJob', placeLauncherParams);
  const isPlayTogetherGame = placeLauncherParams.isPlayTogetherGame === true;
  const params = {
    placelauncherurl: placeLauncherUrl
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params,
    placeId: placeLauncherParams.placeId,
    isPlayTogetherGame
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, accessCode, joinAttemptId, joinAttemptOrigin
function joinPrivateGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = 'play';
  const placeLauncherUrl = getPlaceLauncherUrl('RequestPrivateGame', placeLauncherParams);
  const params = {
    placelauncherurl: placeLauncherUrl
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams: params,
    placeId: placeLauncherParams.placeId
  };

  return startGame(startGameParams);
}

// placeLauncherParams has placeId, conversationId, joinAttemptId, joinAttemptOrigin
function playTogetherGame(placeLauncherParams) {
  const protocol = ProtocolHandlerClientInterface.protocolNameForClient;

  const launchMode = 'play';
  const placeLauncherUrl = getPlaceLauncherUrl('RequestPlayTogetherGame', placeLauncherParams);
  const otherParams = {
    placelauncherurl: placeLauncherUrl
  };
  const startGameParams = {
    protocolName: protocol,
    launchMode,
    otherParams,
    placeId: placeLauncherParams.placeId,
    conversationId: placeLauncherParams.conversationId
  };

  return startGame(startGameParams);
}

async function startDownload() {
  const iframe = document.getElementById('downloadInstallerIFrame');
  let downloadUrl = '/download/client';
  let queryParams = '';

  // NOTE: This policy is needed for deferred deeplinking from Chrome on Windows. Otherwise, the deeplink URL is wiped from the installer
  iframe.referrerPolicy = 'no-referrer';
  const deeplinkParams = await getDeferredDeeplinkQueryParams(window.location.toString());
  queryParams = deeplinkParams;

  iframe.src = `${downloadUrl}${queryParams}`;
}

function startStudioDownload() {
  const iframe = document.getElementById('downloadInstallerIFrame');
  iframe.src = '/download/studio';
}

async function beginProtocolHandlerInstall(gameLaunchDefaultParams, isStudioInstall) {
  // remove gameinfo, if it's there
  let gameLaunchParams = { ...gameLaunchDefaultParams };
  const { gameInfo } = gameLaunchParams;
  if (typeof gameLaunchParams.gameInfo !== 'undefined') {
    gameLaunchParams.gameInfo = undefined;
  }
  // fire begin install event
  $(GameLauncher).trigger(GameLauncher.beginInstallEvent, {
    launchMethod: 'Protocol',
    params: gameLaunchParams
  });
  ProtocolHandlerClientInterface.isInstalling = true;
  // store in cookie
  gameLaunchParams.url = window.location.href;
  // re-add gameInfo, for in-page installation
  if (typeof gameInfo !== 'undefined') {
    gameLaunchParams.gameInfo = gameInfo;
  }

  if (isStudioInstall) {
    startStudioDownload();
  } else {
    await startDownload();
  }
}

const ShowInstallationInstructionsDialogInternal = ({ gameLaunchParams }) => {
  const [isVisible, setVisible] = useState(true);
  const onClose = useCallback(() => setVisible(false), []);

  return (
    <WebBloxProvider>
      <TranslationProvider config={translationConfig}>
        <NewInstallDialog
          isOpen={isVisible}
          onClose={onClose}
          continueInstallClick={continueInstallClick}
          gameLaunchParams={gameLaunchParams}
        />
      </TranslationProvider>
    </WebBloxProvider>
  );
};

function protocolHandlerInstall(gameLaunchParams, showNewDialog = false) {
  const { launchMode } = gameLaunchParams;
  const studioMode = isStudioMode(launchMode);

  $.modal.close();
  if (!studioMode) {
    if (showNewDialog) {
      const container = getDialogContainer();
      ReactDOM.render(
        <ShowInstallationInstructionsDialogInternal gameLaunchParams={gameLaunchParams} />,
        container
      );
    } else {
      Dialog.open({
        titleText: $('#InstallationInstructions .ph-modal-header .title').text(),
        allowHtmlContentInBody: true,
        bodyContent: $('#InstallationInstructions .modal-content-container').html(),
        allowHtmlContentInFooter: true,
        footerText: $('#InstallationInstructions .xsmall').html(),
        acceptColor: Dialog.none,
        declineColor: Dialog.none,
        cssClass: 'install-instructions-modal',
        xToCancel: true,
        onCloseCallback() {
          $('#ProtocolHandlerClickAlwaysAllowed').hide();
        }
      });
    }

    if ($('#GameLaunchInstructionsLinkScript').length === 0) {
      ProtocolHandlerClientInterface.attachManualDownloadToLink();
    }

    if (gameLaunchParams.placeId && window.localStorage.getItem('ref_info') !== null) {
      const refInfo = (() => {
        const refInfoRaw = window.localStorage.getItem('ref_info');
        window.localStorage.removeItem('ref_info');
        if (!refInfoRaw) return {};
        try {
          return JSON.parse(atob(refInfoRaw));
        } catch {
          return {};
        }
      })();
      // eslint-disable-next-line no-param-reassign
      gameLaunchParams.referredByPlayerId = refInfo[gameLaunchParams.placeId];
    }
    setTimeout(() => {
      $('.VisitButtonContinueGLI a')
        .removeClass('disabled')
        .click(gameLaunchParams, continueInstallClick);
    }, 5000);
  }

  beginProtocolHandlerInstall(gameLaunchParams, studioMode);
}

const ShowNewAreYouInstalledDialog = ({ gameLaunchParams }) => {
  const [isVisible, setVisible] = useState(true);
  const onClose = useCallback(() => setVisible(false), []);
  const callback = useCallback(async () => {
    try {
      protocolHandlerInstall(gameLaunchParams, true);
    } finally {
      onClose();
    }
  }, [gameLaunchParams, onClose]);
  return (
    <WebBloxProvider>
      <TranslationProvider config={translationConfig}>
        <NewDownloadDialog isOpen={isVisible} onClose={onClose} callback={callback} />
      </TranslationProvider>
    </WebBloxProvider>
  );
};

function showAreYouInstalledDialog(onClose, gameLaunchParams, showNewDialog = false) {
  const refactorEnabled = PlaceLauncher.Resources.RefactorEnabled === 'True';
  const { launchMode } = gameLaunchParams;
  const studioMode = isStudioMode(launchMode);

  if (refactorEnabled) {
    if (showNewDialog) {
      const container = getDialogContainer();
      ReactDOM.render(
        <ShowNewAreYouInstalledDialog gameLaunchParams={gameLaunchParams} />,
        container
      );
      return;
    }
    const modalResource = studioMode
      ? PlaceLauncher.Resources.ProtocolHandlerAreYouInstalled.studio
      : PlaceLauncher.Resources.ProtocolHandlerAreYouInstalled.play;
    Dialog.open({
      bodyContent: modalResource.content,
      allowHtmlContentInBody: true,
      showAccept: true,
      acceptColor: Dialog.green,
      acceptText: modalResource.buttonText,
      showDecline: false,
      dismissable: false,
      xToCancel: true,
      footerText: modalResource.footerContent,
      allowHtmlContentInFooter: true,
      onAccept() {
        protocolHandlerInstall(gameLaunchParams);
      },
      cssClass: 'protocolhandler-are-you-installed-modal'
    });
    return;
  }

  $('#ProtocolHandlerAreYouInstalled').modal({
    escClose: true,
    opacity: 80,
    overlayCss: {
      backgroundColor: '#000'
    },
    onClose() {
      onClose();
      $('#ProtocolHandlerInstallButton').off('click');
      $.modal.close();
    },
    zIndex: 1031
  });
  $('#ProtocolHandlerInstallButton, #ProtocolHandlerStudioInstallButton').click(function () {
    protocolHandlerInstall(gameLaunchParams);
  });
}

async function manualDownload() {
  $(GameLauncher).trigger(GameLauncher.manualDownloadEvent, {
    launchMethod: 'Protocol',
    params: {}
  });
  await startDownload();
}

async function attachManualDownloadToLink() {
  $('body #GameLaunchManualInstallLink').click(async function () {
    await manualDownload();
    return false;
  });
}

// attach the functions
Object.assign(ProtocolHandlerClientInterface, {
  // functions
  joinMultiplayerGame,
  openStudio,
  tryAssetInStudio,
  openPluginInStudio,
  editGameInStudio,
  followPlayerIntoGame,
  joinGameInstance,
  joinPrivateGame,
  playTogetherGame,
  manualDownload,
  attachManualDownloadToLink,
  startDownload,
  setLocationHref, // this is used by automated tests to intercept the protocol handler URL for verification.  Do not remove.
  doAuthTicketRequest, // expose this so usable from other places.
  doClientAssertionRequest,
  getClientAssertionEnabled,
  openDesktopUniversalApp,
  // test overrides
  showDialog,
  showLaunchFailureDialog,
  cleanUpAndLogSuccess,
  cleanUpAndLogFailure,
  startGameWithDeepLinkUrl
});

$(document).ready(function () {
  GameLauncher.setGameLaunchInterface(ProtocolHandlerClientInterface);
  const placeLauncherPanel = $('#PlaceLauncherStatusPanel');
  preloadExperimentVariant();
  ProtocolHandlerClientInterface.protocolNameForClient = placeLauncherPanel.data(
    'protocol-name-for-client'
  );
  ProtocolHandlerClientInterface.protocolNameForStudio = placeLauncherPanel.data(
    'protocol-name-for-studio'
  );
  ProtocolHandlerClientInterface.protocolUrlIncludesLaunchTime = placeLauncherPanel.data(
    'protocol-url-includes-launchtime'
  );
  ProtocolHandlerClientInterface.protocolDetectionEnabled = placeLauncherPanel.data(
    'protocol-detection-enabled'
  );
  ProtocolHandlerClientInterface.separateScriptParamsEnabled = placeLauncherPanel.data(
    'protocol-separate-script-parameters-enabled'
  );
  ProtocolHandlerClientInterface.avatarParamEnabled = placeLauncherPanel.data(
    'protocol-avatar-parameter-enabled'
  );
  ProtocolHandlerClientInterface.isJoinAttemptIdEnabled =
    (placeLauncherPanel.data('is-join-attempt-id-enabled') ?? 'False') === 'True';
  ProtocolHandlerClientInterface.robloxLocale = placeLauncherPanel.data('protocol-roblox-locale');
  ProtocolHandlerClientInterface.gameLocale = placeLauncherPanel.data('protocol-game-locale');
  let channel = placeLauncherPanel.data('protocol-channel-name');
  if (typeof channel === 'string' && channel.toUpperCase() !== 'LIVE') {
    ProtocolHandlerClientInterface.channel = channel;
  }

  let studioChannel = placeLauncherPanel.data('protocol-studio-channel-name');
  if (typeof studioChannel === 'string' && studioChannel.toUpperCase() !== 'LIVE') {
    ProtocolHandlerClientInterface.studioChannel = studioChannel;
  }

  let playerChannel = placeLauncherPanel.data('protocol-player-channel-name');
  if (typeof playerChannel === 'string' && playerChannel.toUpperCase() !== 'LIVE') {
    ProtocolHandlerClientInterface.playerChannel = playerChannel;
  }

  if (
    !ProtocolHandlerClientInterface.logger &&
    typeof window.Roblox.ProtocolHandlerLogger !== 'undefined'
  ) {
    ProtocolHandlerClientInterface.logger = window.Roblox.ProtocolHandlerLogger;
  }

  ProtocolHandlerClientInterface.isDuarAutoOptInEnabled = placeLauncherPanel.data(
    'is-duar-auto-opt-in-enabled'
  );

  ProtocolHandlerClientInterface.isDuarOptOutDisabled = placeLauncherPanel.data(
    'is-duar-opt-out-disabled'
  );
});

// todo: set Roblox.ProtocolHandlerClientInterface to be this.
export default ProtocolHandlerClientInterface;
