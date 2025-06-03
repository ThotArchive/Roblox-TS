import {
  BatchRequestFactory,
  BatchItemProcessor,
  BatchRequestProperties,
  BatchRequestProcessor
} from 'core-utilities';
import metricsService from '../../shared/metricsService';
import thumbnailMetaData from '../services/thumbnailMetaData';
import thumbnailUtil from './thumbnailUtil';
import {
  ThumbnailTypes,
  DefaultBatchSize,
  ThumbnailCooldown,
  BatchRequestError,
  ThumbnailRequesters,
  ThumbnailDataItem,
  MetaData,
  ThumbnailQueueItem,
  CustomThumbnailQueueItem,
  Thumbnail
} from '../constants/thumbnail2dConstant';

const { getThumbnailMetaData } = thumbnailMetaData;
const { getCachePropertiesFromMetaData, shouldLogMetrics } = thumbnailUtil;

export class ThumbnailRequester<QueueItem> {
  private batchRequestFactory: BatchRequestFactory<QueueItem, ThumbnailDataItem>;

  private thumbnailProcessorKeySerializer: (item: QueueItem) => string;

  private thumbnailItemIdSerializer: (item: QueueItem) => string;

  private thumbnailRequesters: ThumbnailRequesters<QueueItem, ThumbnailDataItem> = {};

  constructor(
    thumbnailItemIdSerializer: (item: QueueItem) => string,
    thumbnailProcessorKeySerializer: (item: QueueItem) => string
  ) {
    this.batchRequestFactory = new BatchRequestFactory<QueueItem, ThumbnailDataItem>();
    this.thumbnailItemIdSerializer = thumbnailItemIdSerializer;
    this.thumbnailProcessorKeySerializer = thumbnailProcessorKeySerializer;
  }

  getThumbnailRequesterProperties(metaData?: MetaData): BatchRequestProperties {
    if (!metaData)
      return {
        getFailureCooldown: this.batchRequestFactory.createExponentialBackoffCooldown(
          ThumbnailCooldown.minCooldown,
          ThumbnailCooldown.maxCooldown
        ),
        maxRetryAttempts: ThumbnailCooldown.maxRetryAttempts,
        batchSize: DefaultBatchSize,
        debugMode: true
      };
    return {
      getFailureCooldown: this.batchRequestFactory.createExponentialBackoffCooldown(
        metaData.requestMinCooldown,
        metaData.requestMaxCooldown
      ),
      maxRetryAttempts: metaData.requestMaxRetryAttempts,
      batchSize: metaData.requestBatchSize,
      concurrentRequestCount: metaData.concurrentThumbnailRequestCount,
      debugMode: true
    };
  }

  getThumbnailRequester(
    thumbnailRequestProcessor: BatchItemProcessor<QueueItem>,
    thumbnailRequesterKey: string,
    metaData?: MetaData
  ): BatchRequestProcessor<QueueItem, ThumbnailDataItem> {
    const thumbnailRequester = this.thumbnailRequesters[thumbnailRequesterKey];
    if (thumbnailRequester) {
      return thumbnailRequester;
    }
    const processor = this.batchRequestFactory.createRequestProcessor(
      thumbnailRequestProcessor,
      item => this.thumbnailItemIdSerializer(item),
      this.getThumbnailRequesterProperties(metaData)
    );
    this.thumbnailRequesters[thumbnailRequesterKey] = processor;
    return processor;
  }

  processThumbnailBatchRequest(
    item: QueueItem & { type: string },
    thumbnailRequestProcessor: BatchItemProcessor<QueueItem>,
    thumbnailRequesterKey: string = this.thumbnailProcessorKeySerializer(item),
    clearCachedValue?: boolean
  ): Promise<ThumbnailDataItem> {
    const { type = 'custom' } = item;
    const metaData = getThumbnailMetaData();
    const batchRequester = this.getThumbnailRequester(
      thumbnailRequestProcessor,
      thumbnailRequesterKey,
      metaData
    );
    if (clearCachedValue) {
      batchRequester.invalidateItem(item);
    }

    const cacheProperties = getCachePropertiesFromMetaData(metaData);
    return batchRequester
      .queueItem(item, undefined, cacheProperties)
      .then((data: ThumbnailDataItem) => {
        if (metricsService && data.performance && shouldLogMetrics(metaData)) {
          const {
            performance: { duration, retryAttempts },
            thumbnails,
            thumbnail
          } = data;
          const logMetrics = (thumb: Thumbnail) => {
            metricsService
              .logMeasurement('ThumbnailStatusCountWebapp', {
                ThumbnailType: `${type}_2d`,
                Status: thumb.state,
                Version: thumb.version
              })
              .catch(console.debug);
          };
          if (thumbnail) {
            logMetrics(thumbnail);
          }
          if (thumbnails) {
            thumbnails.forEach(logMetrics);
          }
        }
        return data;
      })
      .catch((error: BatchRequestError) => {
        // eslint-disable-next-line no-console
        console.debug({ error });
        if (
          metricsService &&
          shouldLogMetrics(metaData) &&
          error === BatchRequestError.maxAttemptsReached
        ) {
          metricsService
            .logMeasurement('ThumbnailTimeoutWebapp', {
              ThumbnailType: `${type}_2d`
            })
            // eslint-disable-next-line no-console
            .catch(console.debug);
        }

        // chain the rejection so that other listeners get triggered.
        return Promise.reject(error);
      });
  }
}

function defaultThumbnailProcessorKeySerializer({
  targetId = 0,
  token,
  type,
  size,
  format,
  isCircular
}: ThumbnailQueueItem): string {
  return `${targetId.toString()}:${token}:${type}:${size}:${format}:${
    isCircular ? 'circular' : 'regular'
  }`;
}

export default {
  defaultThumbnailRequester: new ThumbnailRequester<ThumbnailQueueItem>(
    (item: ThumbnailQueueItem) => {
      const { type, targetId = 0 } = item;
      if (type === ThumbnailTypes.universeThumbnail || type === ThumbnailTypes.universeThumbnails) {
        return targetId.toString();
      }
      return defaultThumbnailProcessorKeySerializer(item);
    },
    defaultThumbnailProcessorKeySerializer
  ),
  customThumbnailRequester: new ThumbnailRequester<CustomThumbnailQueueItem>(
    (item: CustomThumbnailQueueItem) => item.key,
    () => 'customThumbnailRequester'
  )
};
