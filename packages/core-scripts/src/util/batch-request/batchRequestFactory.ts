import {
  BatchRequestProperties,
  BatchIdSerializer,
  BatchItemProcessor,
  DefaultProcessBatchWaitTime,
  DefaultMaxRetryAttempts,
  DefaultCacheProperties,
  DefaultConcurrentRequestCount,
} from "./batchRequestConstants";
import { createExponentialBackoffCooldown } from "./batchRequestUtil";
import BatchRequestProcessor from "./batchRequestProcessor";

export default class BatchRequestFactory<T, V> {
  public readonly createExponentialBackoffCooldown = createExponentialBackoffCooldown;

  // TODO: old, migrated code
  // eslint-disable-next-line class-methods-use-this
  createRequestProcessor(
    itemsProcessor: BatchItemProcessor<T>,
    itemSerializer: BatchIdSerializer<T>,
    properties: BatchRequestProperties,
  ): BatchRequestProcessor<T, V> {
    if (!properties.processBatchWaitTime) {
      // eslint-disable-next-line no-param-reassign
      properties.processBatchWaitTime = DefaultProcessBatchWaitTime;
    }
    if (!properties.maxRetryAttempts) {
      // eslint-disable-next-line no-param-reassign
      properties.maxRetryAttempts = DefaultMaxRetryAttempts;
    }
    if (!properties.cacheProperties) {
      // eslint-disable-next-line no-param-reassign
      properties.cacheProperties = DefaultCacheProperties;
    }
    if (!properties.concurrentRequestCount) {
      // eslint-disable-next-line no-param-reassign
      properties.concurrentRequestCount = DefaultConcurrentRequestCount;
    }
    return new BatchRequestProcessor<T, V>(itemsProcessor, itemSerializer, properties);
  }
}
