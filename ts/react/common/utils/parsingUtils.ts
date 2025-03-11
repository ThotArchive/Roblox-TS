import { Intl, Presence } from 'Roblox';
import { abbreviateNumber, numberFormat, urlService } from 'core-utilities';
import { EventStreamMetadata } from '../constants/eventStreamConstants';
import {
  TFriendVisits,
  TGameData,
  TGetFriendsResponse,
  TLayoutMetadata,
  TMediaLayoutData
} from '../types/bedev1Types';
import { TComponentType } from '../types/bedev2Types';

export const GAME_STATS_PLACEHOLDER_STRING = '--';

export const dateTimeFormatter = new Intl().getDateTimeFormatter();

export const getInGameFriends = (
  friendData: TGetFriendsResponse[],
  universeId: number
): TGetFriendsResponse[] => {
  return friendData.filter(
    friend =>
      friend.presence?.universeId === universeId &&
      friend.presence?.userPresenceType === Presence.PresenceTypes.InGame
  );
};

export const getFriendVisits = (
  friendData: TGetFriendsResponse[],
  friendVisits: TFriendVisits[] | undefined
): TGetFriendsResponse[] => {
  if (!friendVisits) {
    return [];
  }

  const friendIdMap = new Map<number, TGetFriendsResponse>(
    friendData.map(friend => [friend.id, friend])
  );

  const friendVisitData = friendVisits.map(friendVisit => friendIdMap.get(friendVisit.userId));

  return friendVisitData.filter(
    (friendVisit: TGetFriendsResponse | undefined): friendVisit is TGetFriendsResponse =>
      friendVisit !== undefined
  );
};

export const getVotePercentageValue = (
  upvotes: number | undefined,
  downvotes: number | undefined
): number | undefined => {
  let percentUp = 0;
  if (upvotes === undefined || downvotes === undefined) {
    return undefined;
  }
  if (!Number.isNaN(upvotes) && !Number.isNaN(downvotes)) {
    if (upvotes === 0 && downvotes === 0) {
      return undefined;
    }
    if (upvotes === 0 && downvotes !== 0) {
      percentUp = 0;
    } else if (upvotes !== 0 && downvotes === 0) {
      percentUp = 100;
    } else {
      percentUp = Math.floor((upvotes / (upvotes + downvotes)) * 100);
      percentUp = percentUp > 100 ? 100 : percentUp;
    }
  }
  return percentUp;
};

export const getVotePercentage = (
  upvotes: number | undefined,
  downvotes: number | undefined
): string | undefined => {
  const votePercentageValue = getVotePercentageValue(upvotes, downvotes);

  return votePercentageValue !== undefined ? `${votePercentageValue}%` : undefined;
};

export const getPlayerCount = (playerCount: number): string => {
  return playerCount === -1
    ? GAME_STATS_PLACEHOLDER_STRING
    : abbreviateNumber.getAbbreviatedValue(playerCount);
};

export const capitalize = (args: string): string => {
  return args.charAt(0).toUpperCase() + args.slice(1);
};

export const parseEventParams = (params: Record<string, any>): Record<string, string | number> => {
  return Object.keys(params).reduce<Record<string, string | number>>((acc, key) => {
    if (typeof params[key] === 'object' && params[key]) {
      acc[key] = JSON.stringify(params[key]);
    }

    if (typeof params[key] === 'number') {
      acc[key] = params[key] as number;
    }

    if (typeof params[key] === 'string') {
      acc[key] = encodeURIComponent(params[key]);
    }

    if (typeof params[key] === 'boolean') {
      acc[key] = params[key] ? 1 : 0;
    }

    return acc;
  }, {});
};

export const composeQueryString = (queryParams: Record<string, unknown>): string => {
  const parsedQueryParams = urlService.composeQueryString(queryParams);
  if (!parsedQueryParams) {
    return '';
  }

  return `?${parsedQueryParams}`;
};

type GameImpressionsEventSponsoredAdData = {
  [EventStreamMetadata.AdFlags]: number[];
  [EventStreamMetadata.AdIds]: string[];
};

export const getSponsoredAdImpressionsData = (
  gameData: TGameData[],
  impressedIndexes: number[]
): GameImpressionsEventSponsoredAdData | {} => {
  const hasSponsoredGame = impressedIndexes.some(index => gameData[index]?.isSponsored);

  if (hasSponsoredGame) {
    return {
      [EventStreamMetadata.AdsPositions]: impressedIndexes.map(index =>
        gameData[index].isSponsored ? 1 : 0
      ),
      [EventStreamMetadata.AdFlags]: impressedIndexes.map(index =>
        gameData[index].isSponsored ? 1 : 0
      ),
      [EventStreamMetadata.AdIds]: impressedIndexes.map(
        index => gameData[index]?.nativeAdData || '0'
      )
    };
  }

  return {};
};

export const getThumbnailOverrideAssetId = (
  gameData: TGameData,
  topicId: string | undefined
): number | null => {
  const getAssetIdFromMediaLayoutData = (layoutData: TMediaLayoutData) => {
    const assetId = layoutData?.primaryMediaAsset?.wideImageAssetId;
    if (assetId && assetId !== '0') {
      return parseInt(assetId, 10);
    }

    return null;
  };

  let assetId;

  // If a layout data exists for this sort, use that set
  // If it doesn't, fall back to defaultLayoutData if it exists
  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    assetId = getAssetIdFromMediaLayoutData(gameData.layoutDataBySort[topicId]);
  } else if (gameData.defaultLayoutData) {
    assetId = getAssetIdFromMediaLayoutData(gameData.defaultLayoutData);
  }

  // If there wasn't already a thumbnail override, check the root game data for an asset id
  return assetId || getAssetIdFromMediaLayoutData(gameData);
};

const getThumbnailOverrideListId = (
  gameData: TGameData,
  topicId: string | undefined
): string | undefined => {
  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    return gameData.layoutDataBySort[topicId].primaryMediaAsset?.wideImageListId;
  }

  if (gameData.defaultLayoutData) {
    return gameData.defaultLayoutData.primaryMediaAsset?.wideImageListId;
  }

  return gameData.primaryMediaAsset?.wideImageListId;
};

type TGameImpressionsEventThumbnailIdData = {
  [EventStreamMetadata.ThumbnailAssetIds]: string[];
  [EventStreamMetadata.ThumbnailListIds]: string[];
};

export const getThumbnailAssetIdImpressionsData = (
  gameData: TGameData[],
  topicId: number | string,
  impressedIndexes: number[],
  componentType?: TComponentType
): TGameImpressionsEventThumbnailIdData | {} => {
  if (
    componentType === TComponentType.GridTile ||
    componentType === TComponentType.EventTile ||
    componentType === TComponentType.InterestTile
  ) {
    return {
      [EventStreamMetadata.ThumbnailAssetIds]: impressedIndexes.map(
        index => getThumbnailOverrideAssetId(gameData[index], topicId.toString()) ?? '0'
      ),
      [EventStreamMetadata.ThumbnailListIds]: impressedIndexes.map(
        index => getThumbnailOverrideListId(gameData[index], topicId.toString()) ?? '0'
      )
    };
  }

  return {};
};

type TGameImpressionsEventTileBadgeContextsData = {
  [EventStreamMetadata.TileBadgeContexts]: string[];
};

const getAnalyticsIdFromLayoutData = ({
  tileBadgesByPosition
}: TLayoutMetadata): string | undefined => {
  const analyticsIds: string[] = [];
  if (tileBadgesByPosition) {
    if (tileBadgesByPosition.ImageTopLeft) {
      const badgeContexts = tileBadgesByPosition.ImageTopLeft.map(item => item.analyticsId);
      if (badgeContexts && badgeContexts.length > 0) {
        analyticsIds.push(`ImageTopLeft=${badgeContexts.join('+')}`);
      }
    }
    return analyticsIds.length > 0 ? analyticsIds.join('&') : undefined;
  }
  return undefined;
};

export const getTileBadgeContext = (
  gameData: TGameData,
  topicId: string | undefined
): string | undefined => {
  let tileBadgeContext: string | undefined;

  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    tileBadgeContext = getAnalyticsIdFromLayoutData(gameData.layoutDataBySort[topicId]);
  } else if (gameData.defaultLayoutData) {
    tileBadgeContext = getAnalyticsIdFromLayoutData(gameData.defaultLayoutData);
  }

  return tileBadgeContext;
};

export const getTileBadgeContextsImpressionsData = (
  gameData: TGameData[],
  topicId: number | string,
  impressedIndexes: number[],
  componentType?: TComponentType
): TGameImpressionsEventTileBadgeContextsData | {} => {
  if (
    componentType === TComponentType.GridTile ||
    componentType === TComponentType.EventTile ||
    componentType === TComponentType.InterestTile
  ) {
    return {
      [EventStreamMetadata.TileBadgeContexts]: impressedIndexes.map(
        index => getTileBadgeContext(gameData[index], topicId.toString()) ?? '0'
      )
    };
  }
  return {};
};

type TGameImpressionsEventAbsoluteRowData = {
  [EventStreamMetadata.RowsOnPage]: number[];
  [EventStreamMetadata.PositionsInRow]: number[];
};

export const getAbsoluteRowImpressionsData = (
  startingRow: number | undefined,
  itemsPerRow: number | undefined,
  totalItems: number | undefined,
  impressedIndexes: number[]
): TGameImpressionsEventAbsoluteRowData | {} => {
  if (startingRow !== undefined && itemsPerRow !== undefined && totalItems !== undefined) {
    const rowsOnPage: number[] = [];
    const positionsInRow: number[] = [];
    impressedIndexes.forEach(impressedIndex => {
      const rowNumber = startingRow + Math.floor(impressedIndex / itemsPerRow);
      const positionInRow = impressedIndex % itemsPerRow;

      rowsOnPage.push(rowNumber);
      positionsInRow.push(positionInRow);
    });

    return {
      [EventStreamMetadata.RowsOnPage]: rowsOnPage,
      [EventStreamMetadata.PositionsInRow]: positionsInRow
    };
  }

  return {};
};

// NOTE(jcountryman, 10/25/21): Assumes a comparision of two non-negative
// numeric ranges with the structure of [min, max] and generates a sorted impressed range of
// indexes based off baseline range.
export const calculateImpressedIndexes = (
  baseline: [number, number] | undefined,
  compared: [number, number]
): number[] => {
  if (baseline === undefined) {
    return Array.from(new Array(compared[1] - compared[0] + 1), (_, index) => index + compared[0]);
  }

  // NOTE(jcountryman, 10/25/21): Left intersect is not inclusive of max value
  // in range and right intersect is not inclusive of min value.
  const leftIntersect =
    compared[0] < baseline[0] ? ([compared[0], baseline[0]] as [number, number]) : undefined;
  const rightIntersect =
    compared[1] > baseline[1] ? ([baseline[1], compared[1]] as [number, number]) : undefined;
  const leftIntersectIndexes = leftIntersect
    ? new Array(leftIntersect[1] - leftIntersect[0])
        .fill(0)
        .map((_, index) => index + leftIntersect[0])
    : [];
  const rightIntersectIndexes = rightIntersect
    ? new Array(rightIntersect[1] - rightIntersect[0])
        .fill(0)
        .map((_, index) => index + rightIntersect[0] + 1)
    : [];

  return [...leftIntersectIndexes, ...rightIntersectIndexes];
};

export const splitArray = <T>(input: T[], maxSize: number): T[][] => {
  if (input.length === 0 || maxSize === 0) {
    return [input];
  }

  const numberOfSubArrays = Math.ceil(input.length / maxSize);
  return new Array(numberOfSubArrays)
    .fill(0)
    .map((_, index) => input.slice(index * maxSize, (index + 1) * maxSize));
};

export const { parseQueryString } = urlService;
export const { getNumberFormat } = numberFormat;

export const getQueryParamIfString = (key: string): string | undefined => {
  const queryParam = urlService.getQueryParam(key);

  if (queryParam && typeof queryParam === 'string') {
    return queryParam;
  }

  return undefined;
};

type TInputUniverseIdsRequestParameter =
  | {
      inputUniverseIds: {
        interestCatcher: number[];
      };
    }
  | {};

export const getInputUniverseIdsRequestParam = (
  interestedUniverses: number[] | undefined
): TInputUniverseIdsRequestParameter => {
  if (interestedUniverses !== undefined) {
    // Passes empty array for interestCatcher param if user has no interested universes
    return {
      inputUniverseIds: {
        interestCatcher: interestedUniverses.map(universeId => universeId.toString())
      }
    };
  }

  return {};
};

export default {
  capitalize,
  parseEventParams,
  getInGameFriends,
  getVotePercentageValue,
  getVotePercentage,
  getPlayerCount,
  getNumberFormat,
  dateTimeFormatter,
  parseQueryString,
  composeQueryString,
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
  calculateImpressedIndexes,
  splitArray,
  GAME_STATS_PLACEHOLDER_STRING,
  getQueryParamIfString,
  getInputUniverseIdsRequestParam
};
