import { AxiosResponse } from 'axios';
import { BatchRequestProcessor } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';

const { thumbnailsApi } = EnvironmentUrls;

export const ThumbnailMetadataUrl = `${thumbnailsApi}/v1/metadata`;

export enum BatchRequestError {
  processFailure = 'processFailure',
  unretriableFailure = 'unretriableFailure',
  maxAttemptsReached = 'maxAttemptsReached'
}
export enum RobloxThumbnailsApisModelsThumbnailBatchRequestTypeEnum {
  Avatar = 'Avatar',
  AvatarHeadShot = 'AvatarHeadShot',
  GameIcon = 'GameIcon',
  BadgeIcon = 'BadgeIcon',
  GameThumbnail = 'GameThumbnail',
  GamePass = 'GamePass',
  Asset = 'Asset',
  BundleThumbnail = 'BundleThumbnail',
  Outfit = 'Outfit',
  GroupIcon = 'GroupIcon',
  DeveloperProduct = 'DeveloperProduct',
  PlaceIcon = 'PlaceIcon',
  LookThumbnail = 'Look',
  Screenshot = 'Screenshot'
}

export enum ThumbnailTypes {
  avatar = 'Avatar',
  avatarHeadshot = 'AvatarHeadshot',
  gameIcon = 'GameIcon',
  gameThumbnail = 'GameThumbnail',
  badgeIcon = 'BadgeIcon',
  gamePassIcon = 'GamePass',
  assetThumbnail = 'Asset',
  bundleThumbnail = 'BundleThumbnail',
  userOutfit = 'Outfit',
  groupIcon = 'GroupIcon',
  developerProductIcon = 'DeveloperProduct',
  universeThumbnail = 'UniverseThumbnail',
  universeThumbnails = 'UniverseThumbnails',
  placeGameIcon = 'PlaceGameIcon',
  lookThumbnail = 'Look',
  screenshot = 'Screenshot'
}

export const DefaultBatchSize = 100;

export enum ThumbnailCooldown {
  maxRetryAttempts = 10,
  minCooldown = 1000,
  maxCooldown = 30000
}

// expand when batchRequestProcessor is implemented
export interface ThumbnailRequesters<QueueItem, QueueItemData> {
  [key: string]: BatchRequestProcessor<QueueItem, QueueItemData>;
}

export interface ThumbnailCache {
  [key: string]: object;
}

export const DefaultThumbnailSize = '150x150';

export const DefaultThumbnailFormat = 'webp';

export enum ThumbnailGameIconSize {
  size50 = '50x50',
  size150 = '150x150',
  size256 = '256x256',
  size512 = '512x512'
}

export enum ThumbnailGamePassIconSize {
  size150 = '150x150'
}

export enum ThumbnailAssetsSize {
  size150 = '150x150',
  size420 = '420x420',
  size700 = '700x700',
  width1320 = '1320x440',
  width660 = '660x220',
  width330 = '330x110'
}

export enum ThumbnailAvatarsSize {
  size100 = '100x100',
  size352 = '352x352',
  size720 = '720x720'
}

export enum ThumbnailAvatarHeadshotSize {
  size48 = '48x48',
  size60 = '60x60',
  size150 = '150x150'
}

export enum ThumbnailGroupIconSize {
  size150 = '150x150',
  size420 = '420x420'
}

export enum ThumbnailBadgeIconSize {
  size150 = '150x150'
}

export enum ThumbnailDeveloperProductIconSize {
  size150 = '150x150'
}

export enum ThumbnailGameThumbnailSize {
  width768 = '768x432',
  width576 = '576x324',
  width480 = '480x270',
  width384 = '384x216',
  width256 = '256x144'
}

export enum ThumbnailUniverseThumbnailSize {
  width768 = '768x432',
  width576 = '576x324',
  width480 = '480x270',
  width384 = '384x216',
  width256 = '256x144'
}

export enum ThumbnailStates {
  error = 'Error',
  complete = 'Completed',
  inReview = 'InReview',
  pending = 'Pending',
  blocked = 'Blocked'
}

export enum ThumbnailFormat {
  png = 'png',
  jpg = 'jpg',
  jpeg = 'jpeg',
  webp = 'webp'
}

export enum ReturnPolicy {
  PlaceHolder = 'PlaceHolder',
  AutoGenerated = 'AutoGenerated',
  ForceAutoGenerated = 'ForceAutoGenerated'
}

export interface ThumbnailQueueItem {
  targetId?: number;
  token?: string;
  type: ThumbnailTypes;
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
    | ThumbnailDeveloperProductIconSize;
  format: ThumbnailFormat;
  isCircular?: boolean;
}

export interface CustomThumbnailQueueItem {
  key: string;
}

export interface ThumbnailPendingTrackerItem {
  startTime: number;
}

export interface ThumbnailCompleteTrackerItem {
  startTime: number;
}

export interface ThumbnailPendingTracker {
  [key: string]: ThumbnailPendingTrackerItem;
}

export interface ThumbnailCompleteTracker {
  [key: string]: ThumbnailCompleteTrackerItem;
}
export interface ThumbnailPerformance {
  duration: number;
  retryAttempts: number;
}

export interface Thumbnail {
  requestId?: string;
  targetId: number;
  state: ThumbnailStates;
  imageUrl?: string;
  version: string;
}

export interface CustomThumbnail {
  key?: string;
  state: ThumbnailStates;
  imageUrl?: string;
}

export interface UniverseThumbnails {
  universeId: number;
  error?: string;
  thumbnails: Thumbnail[];
}

export interface ThumbnailDataItem {
  thumbnail?: Thumbnail;
  thumbnails?: Thumbnail[];
  errorcode?: number;
  errorMessage?: string;
  performance?: ThumbnailPerformance;
}

export interface ThumbnailData<T> {
  data: Array<T>;
}

export interface ThumbnailDataData<T> {
  data: ThumbnailData<T>;
}

export interface MetaData {
  isWebappUseCacheEnabled: boolean;
  webappCacheExpirationTimespan: string;
  thumbnailMetricsSampleSize: number;
  requestMinCooldown: number;
  requestMaxCooldown: number;
  requestMaxRetryAttempts: number;
  requestBatchSize: number;
  concurrentThumbnailRequestCount: number;
}

export interface MetaDataTask {
  resolve: (metaData: MetaData) => void;
  reject: (error: string) => void;
}

export type MetaDataResponse = AxiosResponse<MetaData>;

export const FeatureName = 'Thumbnail2DWeb';
export const LoadSuccessName = 'LoadSuccess';
export const LoadRetrySuccessName = 'RetryLoadSuccess';
export const RetryPerThumbnailType = 'RetryPerThumbnailType';
export const LoadSuccessMetricsType = 'Sequence';
export const LoadFailureName = 'LoadFailure';
export const LoadFailureMetricsType = 'Counter';

export const DEFAULT_META_DATA = {
  thumbnailMetricsSampleSize: 10,
  isWebappUseCacheEnabled: false,
  webappCacheExpirationTimespan: '00:00:00',
  requestMinCooldown: 1000,
  requestMaxCooldown: 3000,
  requestMaxRetryAttempts: 5,
  requestBatchSize: 100,
  concurrentThumbnailRequestCount: 1
};
