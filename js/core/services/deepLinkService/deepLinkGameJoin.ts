import { GameLauncher, ProtocolHandlerClientInterface } from 'Roblox';
import { DeepLink, UrlPart } from './deepLinkConstants';

const deepLinkGameJoin = (target: DeepLink): Promise<boolean> => {
  const { params } = target;
  if (!params.placeId) {
    return Promise.resolve(false);
  }

  if (params.linkCode) {
    window.location.href = `${UrlPart.Games}/${params.placeId}?privateServerLinkCode=${params.linkCode}`;
  } else if (params.accessCode) {
    window.location.href = `${UrlPart.GameStart}?placeId=${params.placeId}&accessCode=${params.accessCode}`;
  } else if (params.launchData) {
    const launchLink = `${UrlPart.ExperienceLauncher}placeId=${params.placeId}${
      params.launchData ? `&launchData=${params.launchData}` : ''
    }`;
    ProtocolHandlerClientInterface.startGameWithDeepLinkUrl(launchLink, Number(params.placeId));
  } else {
    GameLauncher.joinMultiplayerGame(parseFloat(params.placeId), true, false);
  }

  return Promise.resolve(true);
};

export default deepLinkGameJoin;
