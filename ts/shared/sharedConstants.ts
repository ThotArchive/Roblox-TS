import { EnvironmentUrls } from 'Roblox';

const { thumbnailsApi } = EnvironmentUrls;

export const getBatchMetricsUrl = () => {
  return `${thumbnailsApi}/v1/measurements`;
};

export const DefaultBatchSize = 100;
export const DefaultProcessBatchWaitTime = 1000;

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

export interface Measure {
  taskId?: number;
  metricName: string;
  jsonData: string;
}
export interface JsonData {
  Status?: string;
  ThumbnailType?: string;
  Value?: string;
  Version?: string;
}

export interface MetricsResult {
  [key: string]: boolean;
}
