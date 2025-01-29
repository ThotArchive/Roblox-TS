import Roblox, {
  AccessManagementUpsellService,
  EnvironmentUrls,
  EventStream,
  GameLauncher,
  IdentityVerificationService
} from 'Roblox';
import { eventStreamService, playGameService, TJoinDataProperties } from 'core-roblox-utilities';
import { uuidService } from 'core-utilities';
import { deviceMeta as DeviceMeta, jsClientDeviceIdentifier } from 'header-scripts';
import playButtonConstants, { PlayabilityStatus } from '../constants/playButtonConstants';
import {
  TAgeGuidelinesResponse,
  TPlayabilityStatus,
  TPlayabilityStatusWithUnplayableError
} from '../types/playButtonTypes';

const { unlockPlayIntentConstants } = playButtonConstants;

type TEventProperties = Record<string, string | number | undefined>;
type TJoinAttemptProperties = {
  joinAttemptId?: string;
  joinAttemptOrigin?: string | number;
};

function getJoinAttemptProperties(eventProperties: TEventProperties): TJoinAttemptProperties {
  if (!GameLauncher.isJoinAttemptIdEnabled()) {
    return {};
  }

  const { joinAttemptOrigin } = eventProperties;
  let { joinAttemptId } = eventProperties;
  joinAttemptId =
    typeof joinAttemptId === 'string' ? joinAttemptId : uuidService.generateRandomUuid();
  return { joinAttemptId, joinAttemptOrigin };
}

function sendPlayGameClickedEvent(
  eventProperties: TEventProperties,
  placeId: string,
  joinDataProperties: TJoinDataProperties
): TEventProperties {
  const mergedProperties = {
    placeId,
    ...eventProperties,
    ...getJoinAttemptProperties(eventProperties),
    ...joinDataProperties
  };

  eventStreamService.sendEventWithTarget('playGameClicked', 'click', mergedProperties);

  return mergedProperties;
}

function getEncodedUniversalLink(placeId: string, eventProperties: TEventProperties = {}): string {
  let universalLink = `${EnvironmentUrls.websiteUrl}/games/start?placeid=${placeId}`;

  if (GameLauncher.isJoinAttemptIdEnabled()) {
    const { joinAttemptId, joinAttemptOrigin } = getJoinAttemptProperties(eventProperties);

    if (typeof joinAttemptId === 'string' && joinAttemptId.length > 0) {
      universalLink += `&joinAttemptId=${joinAttemptId}`;

      if (typeof joinAttemptOrigin === 'string' && joinAttemptOrigin.length > 0) {
        universalLink += `&joinAttemptOrigin=${joinAttemptOrigin}`;
      }
    }
  }

  // append join data
  const { launchData, eventId } = eventProperties;
  if (typeof launchData === 'string' && launchData.length > 0) {
    universalLink += `&launchData=${launchData}`;
  }
  if (typeof eventId === 'string' && eventId.length > 0) {
    universalLink += `&eventId=${eventId}`;
  }

  return encodeURIComponent(universalLink);
}

export const launchGame = (
  placeId: string,
  rootPlaceId?: string,
  privateServerLinkCode?: string,
  gameInstanceId?: string,
  eventProperties: TEventProperties = {},
  joinData: TJoinDataProperties = {}
): void => {
  const deviceMeta = DeviceMeta.getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    jsClientDeviceIdentifier.isIos13Ipad ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent(
      eventProperties,
      placeId,
      joinData
    );
    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    window.open(
      `https://ro.blox.com/Ebh5?pid=experiencestart_mobileweb&is_retargeting=false&af_dp=${encodedUniversalLink}&af_web_dp=${encodedUniversalLink}&deep_link_value=${encodedUniversalLink}`,
      '_self'
    );
  } else {
    // TODO(npatel, 2024-12-03): Modularize this code separately and add stricter type validation via zod.
    let referredByPlayerId = '0';
    if (window.localStorage.getItem('ref_info') !== null) {
      const refInfo: { [key: string]: string } = (() => {
        const refInfoRaw = window.localStorage.getItem('ref_info');
        if (!refInfoRaw) return {};
        try {
          return JSON.parse(atob(refInfoRaw)) as { [key: string]: string };
        } catch {
          return {};
        }
      })();
      referredByPlayerId = refInfo[placeId];
    }
    playGameService.launchGame(
      playGameService.buildPlayGameProperties(
        rootPlaceId,
        placeId,
        gameInstanceId,
        /* playerId= */ undefined,
        privateServerLinkCode,
        referredByPlayerId,
        joinData
      ),
      playButtonConstants.eventStreamProperties(placeId, eventProperties)
    );
    if (window.localStorage.getItem('ref_info')) {
      window.localStorage.removeItem('ref_info');
    }
  }
};

export const launchLogin = (placeId: string): void => {
  const deviceMeta = DeviceMeta.getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    jsClientDeviceIdentifier.isIos13Ipad ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent({}, placeId, {});
    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    window.open(
      `https://ro.blox.com/Ebh5?pid=experiencestart_mobileweb&is_retargeting=false&af_dp=${encodedUniversalLink}&af_web_dp=${encodedUniversalLink}&deep_link_value=${encodedUniversalLink}`,
      '_self'
    );
  } else {
    playGameService.launchGame(
      playGameService.buildPlayGameProperties(undefined, placeId.toString()),
      playButtonConstants.eventStreamProperties(placeId, {})
    );
  }
};

export const startVerificationFlow = async (): Promise<[boolean, boolean]> => {
  try {
    return IdentityVerificationService.startVerificationFlow();
  } catch (e) {
    return [false, false];
  }
};

export const startVoiceOptInOverlayFlow = async (
  requireExplicitVoiceConsent: boolean,
  useVoiceUpsellV2Design: boolean
): Promise<boolean> => {
  try {
    return IdentityVerificationService.showVoiceOptInOverlay(
      requireExplicitVoiceConsent,
      useVoiceUpsellV2Design
    );
  } catch (e) {
    return false;
  }
};

export const startAvatarVideoOptInOverlayFlow = async (
  requireExplicitCameraConsent: boolean,
  useCameraU13Design: boolean
): Promise<boolean> => {
  try {
    return IdentityVerificationService.showAvatarVideoOptInOverlay(
      requireExplicitCameraConsent,
      useCameraU13Design
    );
  } catch (e) {
    return false;
  }
};

export const startAccessManagementUpsellFlow = async (): Promise<boolean> => {
  try {
    return await AccessManagementUpsellService.showAccessManagementVerificationModal();
  } catch (e) {
    return false;
  }
};

export const handleShareLinkEventLogging = (placeId: string, universeId: string) => {
  try {
    const shareLinkSourceType = Roblox.UrlParser.getParameterValueByName(
      'shareLinkSourceType',
      false
    );
    if (shareLinkSourceType?.toLowerCase() !== 'experiencedetails') {
      return;
    }

    EventStream.SendEventWithTarget(
      'shareLinkGameJoin',
      'GamePlayButtonWeb',
      {
        placeId,
        universeId
      },
      EventStream.TargetTypes.WWW
    );
  } catch (e) {
    // ignore
  }
};

/**
 * Extract minimumAge from the AgeRecommendation API response,
 * with a special mapping for unrated games to -1.
 */
export const getMinimumAgeFromAgeRecommendationResponse = (
  response: TAgeGuidelinesResponse
): number | undefined => {
  if (
    response?.ageRecommendationDetails?.summary &&
    !response.ageRecommendationDetails.summary.ageRecommendation
  ) {
    // The Age Recommendations data exists in the response,
    // but the actual recommendation is empty.
    // This means the game is unrated, and the user
    // must have a setting of "Ages 13+" or higher to play
    return -1;
  }

  return response?.ageRecommendationDetails?.summary?.ageRecommendation?.minimumAge;
};

export const shouldShowUnplayableButton = (
  playabilityStatus: TPlayabilityStatus | undefined,
  shouldShowVpcPlayButtonUpsells?: boolean,
  hasUpdatedPlayButtonsVpcIxp?: boolean
): playabilityStatus is TPlayabilityStatusWithUnplayableError => {
  // playability is loading
  if (playabilityStatus === undefined) {
    return false;
  }

  // these statuses are never fully unplayable
  if (
    playabilityStatus === PlayabilityStatus.Playable ||
    playabilityStatus === PlayabilityStatus.GuestProhibited ||
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired
  ) {
    return false;
  }

  // this status is not fully unplayable if action needed button is enabled for vpc cases
  if (
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls
  ) {
    if (shouldShowVpcPlayButtonUpsells && hasUpdatedPlayButtonsVpcIxp) {
      return false;
    }
  }

  return true;
};

export const sendUnlockPlayIntentEvent = (
  universeId: string,
  upsellName: string,
  playabilityStatus: TPlayabilityStatus
): void => {
  const eventParams = {
    universeId,
    upsellName,
    playabilityStatus
  };

  eventStreamService.sendEvent(
    {
      name: unlockPlayIntentConstants.eventName,
      type: unlockPlayIntentConstants.eventName,
      context: eventStreamService.eventTypes.formInteraction
    },
    eventParams
  );
};

export default {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startVerificationFlow,
  startVoiceOptInOverlayFlow,
  startAccessManagementUpsellFlow,
  shouldShowUnplayableButton,
  sendUnlockPlayIntentEvent
};
