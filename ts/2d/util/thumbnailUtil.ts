import { BatchRequestFactory, CacheProperties, BatchRequestProperties } from 'core-utilities';
import {
  ThumbnailTypes,
  MetaData,
  DefaultBatchSize,
  ThumbnailCooldown,
  ThumbnailQueueItem,
  RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum,
  ThumbnailDataItem
} from '../constants/thumbnail2dConstant';

interface ThumbnailTypeMapping {
  [key: string]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum;
}

const ThumbnailTypeMapping: ThumbnailTypeMapping = {
  [ThumbnailTypes.avatar]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.Avatar,
  [ThumbnailTypes.avatarHeadshot]:
    RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.AvatarHeadShot,
  [ThumbnailTypes.gameIcon]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.GameIcon,
  [ThumbnailTypes.badgeIcon]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.BadgeIcon,
  [ThumbnailTypes.gamePassIcon]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.GamePass,
  [ThumbnailTypes.assetThumbnail]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.Asset,
  [ThumbnailTypes.bundleThumbnail]:
    RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.BundleThumbnail,
  [ThumbnailTypes.userOutfit]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.Outfit,
  [ThumbnailTypes.groupIcon]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.GroupIcon,
  [ThumbnailTypes.placeGameIcon]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.PlaceIcon,
  [ThumbnailTypes.developerProductIcon]:
    RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.DeveloperProduct,
  [ThumbnailTypes.gameThumbnail]: RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum.GameThumbnail
};

function transformThumbnailType(
  type: ThumbnailTypes
): RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum {
  return ThumbnailTypeMapping[type];
}

function getExpirationMsFromString(timeSpan: string): number {
  const timeSpanFormat = timeSpan.split(':');
  return (
    (parseInt(timeSpanFormat[0], 10) * 60 * 60 +
      parseInt(timeSpanFormat[1], 10) * 60 +
      parseInt(timeSpanFormat[2], 10)) *
    1000
  );
}

function getCachePropertiesFromMetaData(metaData?: MetaData): CacheProperties | undefined {
  if (!metaData) return undefined;
  return {
    useCache: metaData.isWebappUseCacheEnabled,
    expirationWindowMS: getExpirationMsFromString(metaData.webappCacheExpirationTimespan)
  };
}

function getThumbnailRequesterProperties(
  batchRequestFactory: BatchRequestFactory<ThumbnailQueueItem, ThumbnailDataItem>,
  metaData?: MetaData
): BatchRequestProperties {
  if (!metaData)
    return {
      getFailureCooldown: batchRequestFactory.createExponentialBackoffCooldown(
        ThumbnailCooldown.minCooldown,
        ThumbnailCooldown.maxCooldown
      ),
      maxRetryAttempts: ThumbnailCooldown.maxRetryAttempts,
      batchSize: DefaultBatchSize,
      debugMode: true
    };
  return {
    getFailureCooldown: batchRequestFactory.createExponentialBackoffCooldown(
      metaData.requestMinCooldown,
      metaData.requestMaxCooldown
    ),
    maxRetryAttempts: metaData.requestMaxRetryAttempts,
    batchSize: metaData.requestBatchSize,
    concurrentRequestCount: metaData.concurrentThumbnailRequestCount,
    debugMode: true
  };
}

function shouldLogMetrics(metaData?: MetaData): boolean {
  if (!metaData) return true;
  const { thumbnailMetricsSampleSize } = metaData;
  return Math.floor(Math.random() * 100) <= thumbnailMetricsSampleSize;
}

export default {
  transformThumbnailType,
  getExpirationMsFromString,
  getThumbnailRequesterProperties,
  getCachePropertiesFromMetaData,
  shouldLogMetrics
};
