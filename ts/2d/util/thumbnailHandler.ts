import { QueueItem, ItemProcessorResult } from 'core-utilities';
import { dataStores } from 'core-roblox-utilities';
import thumbnailUtil from './thumbnailUtil';

import {
  ThumbnailStates,
  ThumbnailDataData,
  ThumbnailDataItem,
  ThumbnailQueueItem,
  ThumbnailUniverseThumbnailSize,
  Thumbnail,
  UniverseThumbnails
} from '../constants/thumbnail2dConstant';

const { transformThumbnailType } = thumbnailUtil;

const { thumbnailsDataStore, gameThumbnailsDataStore } = dataStores;

export class ThumbnailBatchHandler<BatchResponse, RequestQueueItem> {
  private storeInstance: (
    items: Array<QueueItem<RequestQueueItem>>,
    limit?: number
  ) => Promise<ThumbnailDataData<BatchResponse>>;

  private keySetter: (item: BatchResponse) => string;

  private keyGetter: (item: QueueItem<RequestQueueItem>) => string;

  private validator: (item: BatchResponse) => boolean;

  private resultSetter: (item: BatchResponse, limit?: number) => ThumbnailDataItem;

  constructor(
    storeInstance: (
      items: Array<QueueItem<RequestQueueItem>>,
      limit?: number
    ) => Promise<ThumbnailDataData<BatchResponse>>,
    keySetter: (item: BatchResponse) => string,
    keyGetter: (item: QueueItem<RequestQueueItem>) => string,
    validator: (item: BatchResponse) => boolean,
    resultSetter: (item: BatchResponse, limit?: number) => ThumbnailDataItem
  ) {
    // data store used to make api call
    this.storeInstance = storeInstance;
    // key used for setting results
    this.keySetter = keySetter;
    // key used for getting results
    this.keyGetter = keyGetter;
    // validate thumbnail status
    this.validator = validator;
    // sets thumbnail results
    this.resultSetter = resultSetter;
  }

  handle(items: Array<QueueItem<RequestQueueItem>>, limit?: number): Promise<ItemProcessorResult> {
    return new Promise(resolve => {
      this.storeInstance(items, limit)
        .then((thumbnailData: ThumbnailDataData<BatchResponse>) => {
          const thumbnailResults = new Map<string, BatchResponse>();
          const results: { [key: string]: ThumbnailDataItem } = {};
          const itemsData = thumbnailData?.data?.data ?? new Array<BatchResponse>();

          itemsData.forEach((item: BatchResponse) => {
            thumbnailResults.set(this.keySetter(item), item);
          });

          items.forEach((queueItem: QueueItem<RequestQueueItem>) => {
            const itemKey = this.keyGetter(queueItem);
            if (thumbnailResults.has(itemKey)) {
              const result = thumbnailResults.get(itemKey);
              if (result && this.validator(result)) {
                results[itemKey] = this.resultSetter(result, limit);
              }
            } else {
              let errorState = {};
              if (limit && limit > 1) {
                errorState = { thumbnails: [] };
              } else {
                errorState = {
                  thumbnail: {
                    targetId: itemKey,
                    state: ThumbnailStates.error
                  }
                };
              }

              results[itemKey] = {
                ...errorState,
                errorcode: 3,
                errorMessage: "id doesn't exist"
              };
            }
          });

          resolve(results);
        })

        .catch(() => {
          // No success cases this time, all will be retried.
          resolve({});
        });
    });
  }
}

export default {
  batchRequestHandler: new ThumbnailBatchHandler<Thumbnail, ThumbnailQueueItem>(
    (items: Array<QueueItem<ThumbnailQueueItem>>) => {
      const requests = items.map(({ data: { type, ...otherData }, key }) => ({
        requestId: key,
        type: transformThumbnailType(type),
        ...otherData
      }));
      return new Promise<ThumbnailDataData<Thumbnail>>((resolve, reject) => {
        thumbnailsDataStore.getBatchThumbnails(requests).then(resolve).catch(reject);
      });
    },
    (item: Thumbnail) => item.requestId || '',
    (item: QueueItem<ThumbnailQueueItem>) => item.key,
    (item: Thumbnail) => item.state !== ThumbnailStates.pending,
    (item: Thumbnail) => ({ thumbnail: item })
  ),
  universeThumbnailHandler: new ThumbnailBatchHandler<UniverseThumbnails, ThumbnailQueueItem>(
    (items: Array<QueueItem<ThumbnailQueueItem>>, limit) => {
      return new Promise<ThumbnailDataData<UniverseThumbnails>>((resolve, reject) => {
        gameThumbnailsDataStore
          .getAllUniverseThumbnails(
            items.map(({ data: { targetId } }) => targetId || 0),
            <ThumbnailUniverseThumbnailSize>items[0]?.data.size,
            items[0]?.data.format,
            items[0]?.data.isCircular,
            limit
          )
          .then(resolve)
          .catch(reject);
      });
    },

    (item: UniverseThumbnails) => item.universeId.toString(),
    (item: QueueItem<ThumbnailQueueItem>) =>
      item.data.targetId ? item.data.targetId.toString() : '',
    (item: UniverseThumbnails) => !item.error,
    (result: UniverseThumbnails, limit) => {
      return limit === 1 ? { thumbnail: result.thumbnails[0] } : { thumbnails: result.thumbnails };
    }
  )
};
