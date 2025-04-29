import {
  BatchRequestProperties,
  BatchIdSerializer,
  BatchRequestError,
  BatchItemProcessor,
  QueueItem,
  ItemProcessorResult,
  ItemExpirationProcessor,
  FailureCooldownProcessor,
  DefaultCooldown,
  CacheProperties,
} from "./batchRequestConstants";
import CacheStore from "./cacheStore";

class BatchRequestProcessor<T, V> {
  private completeItems: CacheStore;

  private requestQueue: QueueItem<T>[] = [];

  private concurrentRequestCount = 1;

  private isQueueActive = false;

  private debug = false;

  private processorId: number;

  private processStartTime?: number;

  private processEndTime?: number;

  private maxRetryAttempts?: number;

  private getItemExpiration?: ItemExpirationProcessor;

  private batchSize: number;

  private processBatchWaitTime?: number;

  private getFailureCooldown?: FailureCooldownProcessor;

  private cacheProperties?: CacheProperties;

  private itemsProcessor: BatchItemProcessor<T>;

  private itemsSerializer: BatchIdSerializer<T>;

  constructor(
    itemsProcessor: BatchItemProcessor<T>,
    itemsSerializer: BatchIdSerializer<T>,
    properties: BatchRequestProperties,
  ) {
    const {
      cacheProperties,
      processBatchWaitTime,
      batchSize,
      maxRetryAttempts,
      getItemExpiration,
      getFailureCooldown,
      debugMode,
      concurrentRequestCount,
    } = properties;
    const { useCache, expirationWindowMS } = cacheProperties ?? {};
    this.cacheProperties = cacheProperties;
    this.completeItems = new CacheStore(useCache, expirationWindowMS);
    this.processBatchWaitTime = processBatchWaitTime;
    this.batchSize = batchSize;
    this.maxRetryAttempts = maxRetryAttempts;
    this.getItemExpiration = getItemExpiration;
    this.getFailureCooldown = getFailureCooldown;
    this.itemsProcessor = itemsProcessor;
    this.itemsSerializer = itemsSerializer;
    this.debug = debugMode ?? false;
    this.processorId = Date.now();
    this.concurrentRequestCount = concurrentRequestCount ?? 1;
  }

  handleBatchResult(batch: QueueItem<T>[], error: BatchRequestError): void {
    let minimumCooldown = 0;
    const currentDate = new Date().getTime();
    batch.forEach((request: QueueItem<T>) => {
      if (this.completeItems.has(request.key, request.cacheProperties)) {
        const requestCompleteTime = new Date().getTime();
        request.resolve({
          // @ts-expect-error TODO: old, migrated code
          ...this.completeItems.get(request.key, request.cacheProperties),
          ...{
            performance: {
              duration: requestCompleteTime - request.startTime.getTime(),
              retryAttempts: request.retryAttempts,
            },
          },
        });
      } else if (this.maxRetryAttempts && error !== BatchRequestError.unretriableFailure) {
        const itemCooldown = this.getFailureCooldown
          ? this.getFailureCooldown(request.retryAttempts)
          : DefaultCooldown;

        if (minimumCooldown > 0) {
          minimumCooldown = Math.min(minimumCooldown, itemCooldown);
        } else {
          minimumCooldown = itemCooldown;
        }

        // eslint-disable-next-line no-plusplus
        if (++request.retryAttempts <= this.maxRetryAttempts) {
          request.queueAfter = currentDate + itemCooldown;
          // Put in front of the queue to make sure duplicate items
          // don't get processed without the cooldown time.
          this.requestQueue.unshift(request);
        } else {
          request.reject(BatchRequestError.maxAttemptsReached);
        }
      } else {
        // eslint-disable-next-line no-console
        console.debug(error, request);
        request.reject(error);
      }
    });

    this.processEndTime = Date.now();

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`${this.processorId}: process queue ended`, {
        duration:
          this.processStartTime != null ? this.processEndTime - this.processStartTime : undefined,
        requestQueue: this.requestQueue,
        minimumCooldown,
        processBatchWaitTime: this.processBatchWaitTime,
      });
    }

    if (minimumCooldown > 0) {
      setTimeout(
        () => {
          this.processQueue();
        },
        minimumCooldown + (this.processBatchWaitTime ?? 0),
      );
    }
    this.concurrentRequestCount += 1;
    this.processQueue();
  }

  processQueue(): void {
    if (this.concurrentRequestCount === 0 || this.isQueueActive) {
      return;
    }

    this.processStartTime = Date.now();

    const batch: QueueItem<T>[] = [];
    const batchKeys = new Map<string, QueueItem<T>>();
    const requeueRequests: QueueItem<T>[] = [];

    const currentDate = new Date().getTime();

    this.isQueueActive = true;

    while (batch.length < this.batchSize && this.requestQueue.length > 0) {
      // checked `this.requestQueue.length > 0` above
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const request = this.requestQueue.shift()!;
      if (request.queueAfter > currentDate) {
        batchKeys.set(request.key, request);
        requeueRequests.push(request);
      } else if (this.completeItems.has(request.key, request.cacheProperties)) {
        const requestCompleteTime = new Date().getTime();
        request.resolve({
          // @ts-expect-error TODO: old, migrated code
          ...this.completeItems.get(request.key, request.cacheProperties),
          ...{ performance: { duration: requestCompleteTime - request.startTime.getTime() } },
        });
      } else if (batchKeys.has(request.key)) {
        // Requeue to make sure duplicate requests still get resolved once they're completed.
        requeueRequests.push(request);
      } else {
        batchKeys.set(request.key, request);
        batch.push(request);
      }
    }

    this.requestQueue.push(...requeueRequests);
    this.isQueueActive = false;

    if (batch.length <= 0) {
      return;
    }
    this.concurrentRequestCount -= 1;
    this.processQueue();

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`${this.processorId}: process queue start`, {
        timeSinceLastStart: this.processEndTime ? this.processStartTime - this.processEndTime : 0,
        startTime: this.processStartTime,
        requestQueue: this.requestQueue,
        batch: batch.map(e => e.key),
      });
    }

    this.itemsProcessor(batch).then(
      (data: ItemProcessorResult) => {
        Object.entries(data).forEach(([key, value]) => {
          const request = batchKeys.get(key);
          this.saveCompleteItem(key, value, request?.cacheProperties);
        });

        this.handleBatchResult(batch, BatchRequestError.processFailure);
      },
      (error: unknown) => {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.handleBatchResult(batch, error as BatchRequestError);
      },
    );
  }

  saveCompleteItem(key: string, data: unknown, cacheProperties?: CacheProperties): void {
    this.completeItems.set(key, data, cacheProperties ?? this.cacheProperties);
    if (this.getItemExpiration) {
      setTimeout(() => {
        this.completeItems.delete(key);
      }, this.getItemExpiration(key));
    }
  }

  queueItem(item: T, key?: string, cacheProperties?: CacheProperties): Promise<V> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        key: key ?? this.itemsSerializer(item),
        itemId: item, // Deprecated remove after rollout
        data: item,
        retryAttempts: 0,
        queueAfter: 0,
        startTime: new Date(),
        cacheProperties: cacheProperties ?? this.cacheProperties ?? {},
        // @ts-expect-error TODO: old, migrated code
        resolve,
        reject,
      });
      setTimeout(() => {
        this.processQueue();
      }, this.processBatchWaitTime);
    });
  }

  invalidateItem(item: T, key?: string): void {
    const storeKey = key ?? this.itemsSerializer(item);
    this.completeItems.delete(storeKey);
  }

  clearCache(): void {
    this.completeItems.clear();
  }
}

export default BatchRequestProcessor;
