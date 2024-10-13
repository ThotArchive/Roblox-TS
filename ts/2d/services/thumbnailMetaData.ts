import { DEFAULT_META_DATA, MetaData } from '../constants/thumbnail2dConstant';

function getThumbnailMetaData(): MetaData {
  const metaElementData = document.getElementsByName('thumbnail-meta-data')[0]?.dataset;
  if (metaElementData) {
    return {
      thumbnailMetricsSampleSize: parseInt(metaElementData.thumbnailMetricsSampleSize || '', 10),
      isWebappUseCacheEnabled: metaElementData.isWebappCacheEnabled === 'True',
      webappCacheExpirationTimespan: metaElementData.webappCacheExpirationsTimespan || '',
      requestMinCooldown: parseInt(metaElementData.requestMinCooldown || '', 10),
      requestMaxCooldown: parseInt(metaElementData.requestMaxCooldown || '', 10),
      requestMaxRetryAttempts: parseInt(metaElementData.requestMaxRetryAttempts || '', 10),
      requestBatchSize: parseInt(metaElementData.requestBatchSize || '', 10),
      concurrentThumbnailRequestCount: parseInt(metaElementData.concurrentThumbnailRequestCount || '', 10)
    };
  }
  return DEFAULT_META_DATA;
}
export default {
  getThumbnailMetaData
};
