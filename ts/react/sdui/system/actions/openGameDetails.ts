import { SessionInfo } from '@rbx/unified-logging';
import {
  EventStreamMetadata,
  SessionInfoType,
  TCommonReferralParams,
  TGameDetailReferral
} from '../../../common/constants/eventStreamConstants';
import { buildGameDetailUrl } from '../../../common/utils/browserUtils';
import {
  filterInvalidEventParams,
  findAnalyticsFieldInAncestors,
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField
} from '../../utils/analyticsParsingUtils';
import logSduiError, { SduiErrorNames } from '../../utils/logSduiError';
import { TSduiActionConfig } from '../SduiActionHandlerRegistry';
import { TAnalyticsContext } from '../SduiTypes';
import { PageContext } from '../../../common/types/pageContext';

const parseValidNavigationPlaceId = (input: unknown | undefined): number | undefined => {
  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    return parseInt(input, 10);
  }

  return undefined;
};

/**
 * Builds common referral params for use in both gameDetailReferral and playGameClicked events.
 */
export const buildCommonReferralParams = (
  analyticsContext: TAnalyticsContext | undefined
): TCommonReferralParams => {
  const isAd = parseBooleanField(
    findAnalyticsFieldInAncestors('adFlag', analyticsContext, false),
    false
  );
  const position = parseMaybeStringNumberField(
    findAnalyticsFieldInAncestors('itemPosition', analyticsContext, -1),
    -1
  );

  const collectionAnalyticsData = analyticsContext?.getCollectionData
    ? analyticsContext.getCollectionData()
    : undefined;

  const sortPosition =
    collectionAnalyticsData?.collectionPosition ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('collectionPosition', analyticsContext, -1),
      -1
    );
  const numberOfLoadedTiles =
    collectionAnalyticsData?.totalNumberOfItems ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('totalNumberOfItems', analyticsContext, -1),
      -1
    );
  const gameSetTypeId =
    collectionAnalyticsData?.collectionId ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('collectionId', analyticsContext, -1),
      -1
    );

  const homePageSessionInfo = parseStringField(
    findAnalyticsFieldInAncestors(SessionInfo.HomePageSessionInfo, analyticsContext, ''),
    ''
  );

  return {
    [EventStreamMetadata.IsAd]: isAd,
    [EventStreamMetadata.Position]: position,
    [EventStreamMetadata.SortPos]: sortPosition,
    [EventStreamMetadata.NumberOfLoadedTiles]: numberOfLoadedTiles,
    [EventStreamMetadata.GameSetTypeId]: gameSetTypeId,
    // TODO https://roblox.atlassian.net/browse/CLIGROW-2205
    // context should come from sduiContext.pageContext
    [EventStreamMetadata.Page]: PageContext.HomePage,
    [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo
  };
};

/**
 * Build gameDetailReferral event params for compatability with existing pipelines.
 *
 * These params will be attached to the URL params of the resulting game details page,
 * and also used to create the playGameClicked event properties from EDP for play attribution.
 */
const buildGameDetailReferralParams = (
  actionConfig: TSduiActionConfig | undefined,
  analyticsContext: TAnalyticsContext | undefined
): TGameDetailReferral => {
  const filteredActionParams = filterInvalidEventParams(actionConfig?.actionParams ?? {});

  const analyticsPlaceId = parseMaybeStringNumberField(
    filteredActionParams.placeId ?? findAnalyticsFieldInAncestors('placeId', analyticsContext, -1),
    -1
  );
  const analyticsUniverseId = parseMaybeStringNumberField(
    filteredActionParams.universeId ??
      findAnalyticsFieldInAncestors('universeId', analyticsContext, -1),
    -1
  );

  const commonReferralParams = buildCommonReferralParams(analyticsContext);

  const gameDetailReferralEventProperties: TGameDetailReferral = {
    ...commonReferralParams,
    [EventStreamMetadata.PlaceId]: analyticsPlaceId,
    [EventStreamMetadata.UniverseId]: analyticsUniverseId
  };

  return gameDetailReferralEventProperties;
};

const openGameDetails = (
  actionConfig?: TSduiActionConfig,
  analyticsContext?: TAnalyticsContext
): void => {
  const navigationPlaceId = actionConfig?.actionParams?.placeId;

  const parsedNavigationPlaceId = parseValidNavigationPlaceId(navigationPlaceId);

  if (parsedNavigationPlaceId !== undefined) {
    // Build and send gameDetailReferral event params for compatability with existing pipelines.
    const referralParams = buildGameDetailReferralParams(actionConfig, analyticsContext);

    const referralUrl = buildGameDetailUrl(
      parsedNavigationPlaceId,
      '', // game.name (optional and not provided)
      referralParams
    );

    window.location.href = referralUrl;
  } else {
    logSduiError(
      SduiErrorNames.SduiActionOpenGameDetailsInvalidId,
      `Invalid id ${JSON.stringify(navigationPlaceId)} to open game details`
    );
  }
};

export default openGameDetails;
