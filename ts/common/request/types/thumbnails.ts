/**
 * Thumbnails
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const thumbnailsApiUrl = EnvironmentUrls.thumbnailsApi ?? URL_NOT_FOUND;

// Incomplete type:
export enum ThumbnailsError {
  UNKNOWN = 0
}

/**
 * Request type for icon size.
 */
export type IconSize = '50x50' | '128x128' | '150x150' | '256x256' | '512x512';

/**
 * Request type for icon format.
 */
export enum IconFormat {
  PNG = 'Png',
  JPEG = 'Jpeg'
}

/**
 * Thumbnail processing state.
 */
export enum ProcessingState {
  ERROR = 'Error',
  COMPLETED = 'Completed',
  IN_REVIEW = 'InReview',
  PENDING = 'Pending',
  BLOCKED = 'Blocked'
}

// Incomplete type (we only care about icon URLs):
export type GetIconsForUniverseIdsReturnType = {
  data: {
    targetId: number;
    state: ProcessingState;
    imageUrl: string;
  }[];
};

/**
 * Request Type: `GET`.
 */
export const GET_ICONS_FOR_UNIVERSE_IDS_CONFIG: UrlConfig = {
  url: `${thumbnailsApiUrl}/v1/games/icons`,
  timeout: 10000
};
