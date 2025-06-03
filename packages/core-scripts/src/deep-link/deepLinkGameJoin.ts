import "../global";
import { DeepLink, UrlPart } from "./deepLinkConstants";

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
      params.launchData ? `&launchData=${params.launchData}` : ""
    }`;
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.Roblox.ProtocolHandlerClientInterface!.startGameWithDeepLinkUrl(
      launchLink,
      Number(params.placeId),
    );
  } else {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.Roblox.GameLauncher!.joinMultiplayerGame(parseFloat(params.placeId), true, false);
  }

  return Promise.resolve(true);
};

export default deepLinkGameJoin;
