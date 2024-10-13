import { QueueItem } from 'core-utilities';
import thumbnailRequesters from '../util/thumbnailRequester';
import thumbnailHanders from '../util/thumbnailHandler';

import {
  ThumbnailTypes,
  ThumbnailStates,
  ThumbnailAssetsSize,
  ThumbnailGameIconSize,
  ThumbnailGamePassIconSize,
  ThumbnailGameThumbnailSize,
  ThumbnailUniverseThumbnailSize,
  ThumbnailGroupIconSize,
  ThumbnailBadgeIconSize,
  ThumbnailDeveloperProductIconSize,
  ThumbnailAvatarsSize,
  ThumbnailFormat,
  ThumbnailAvatarHeadshotSize,
  ThumbnailQueueItem
} from '../constants/thumbnail2dConstant';

const { batchRequestHandler, universeThumbnailHandler } = thumbnailHanders;

const { defaultThumbnailRequester } = thumbnailRequesters;

const loadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  clearCachedValue?: boolean
) => {
  if (!targetId && !token) {
    return new Promise((resolve, reject) => {
      reject(new Error('TargetId or token can not be empty.'));
    });
  }

  if (!thumbnailType) {
    return new Promise((resolve, reject) => {
      reject(new Error('ThumbnailType can not be empty.'));
    });
  }

  if (format == null)
  {
    format = ThumbnailFormat.webp;
  }
  
  // Temp solution to override game icon request format for security purpose
  let formatOverride = format;
  if (thumbnailType === ThumbnailTypes.gameIcon || thumbnailType === ThumbnailTypes.gameThumbnail || thumbnailType === ThumbnailTypes.placeGameIcon || thumbnailType === ThumbnailTypes.universeThumbnail) { 
    formatOverride = ThumbnailFormat.webp;
  }

  const item = {
    targetId,
    token,
    type: thumbnailType,
    format: formatOverride,
    size
  };

  const customHandler = [ThumbnailTypes.universeThumbnails, ThumbnailTypes.universeThumbnail];
  // null requesterKey creates new batch request processor.
  const requesterKey = !customHandler.includes(thumbnailType) ? 'thumbnail2dProcessor' : 'universeThumbnailProcessor';
  return defaultThumbnailRequester.processThumbnailBatchRequest(
    item,
    (items: Array<QueueItem<ThumbnailQueueItem>>) => {
      if (thumbnailType === ThumbnailTypes.universeThumbnail) {
        return universeThumbnailHandler.handle(items, 1);
      }

      if (thumbnailType === ThumbnailTypes.universeThumbnails) {
        return universeThumbnailHandler.handle(items, 10);
      }

      return batchRequestHandler.handle(items);
    },
    requesterKey,
    clearCachedValue
  );
};

const getThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string
) => {
  return loadThumbnailImage(thumbnailType, size, format, targetId, token, false);
};

const reloadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string
) => {
  return loadThumbnailImage(thumbnailType, size, format, targetId, token, true);
};

const getCssClass = (thumbnailState: ThumbnailStates) => {
  return {
    'icon-broken': thumbnailState === ThumbnailStates.error,
    'icon-in-review': thumbnailState === ThumbnailStates.inReview,
    'icon-blocked': thumbnailState === ThumbnailStates.blocked,
    'icon-pending': thumbnailState === ThumbnailStates.pending
  };
};

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export default window.RobloxThumbnails?.thumbnailService || {
  getThumbnailImage,
  getCssClass,
  reloadThumbnailImage
};
