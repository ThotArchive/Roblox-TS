import { AxiosPromise, httpService } from 'core-utilities';
import urlConfigs from '../constants/urlConfigs';
import {
  TItemDetailRequestEntry,
  TDetailResult,
  TDetailEntry,
  ItemDetailsHydrationStatus,
  itemDetailsHydrationServiceTimings,
  TAwaitedHyrdatedItemDetails,
  retriesForHydration,
  retriesForCollectiblesHydration,
  TCollectibleDetailEntry,
  TAwaitedHydratedCollectibleDetails
} from '../constants/itemDetailsHydrationConstants';
import {
  getItemDetail,
  createItemDetailHydrationEntry,
  sleep,
  setItemDetailHydrationEntry,
  cleanLocalStorage,
  getPurchaseInfo
} from '../utils/itemDetailsHydrationServiceUtils';

export const postItemDetails = (
  items: Array<TItemDetailRequestEntry>
): AxiosPromise<TDetailResult> => {
  const params = {
    items
  };
  return httpService.post(urlConfigs.postItemDetails, params);
};

export const postCollectibleItemDetails = (
  itemIds: Array<string>
): AxiosPromise<Array<TCollectibleDetailEntry>> => {
  const requestBody = {
    itemIds
  };
  return httpService.post(urlConfigs.postCollectibleItemDetails, requestBody);
};

export const postItemDetailsWithRetries = async (
  items: Array<TItemDetailRequestEntry>,
  retriesRemaining: number
): Promise<Array<TDetailEntry> | undefined> => {
  try {
    if (retriesRemaining <= 0 || items.length <= 0) {
      return undefined;
    }
    const resultArray = new Array<TDetailEntry>();
    const itemDetailsHydrationCallResult = await Promise.resolve(postItemDetails(items));
    itemDetailsHydrationCallResult.data.data.forEach(item => {
      resultArray.push({
        ...item,
        purchaseInfo:
          item.collectibleItemId === undefined ? getPurchaseInfo(item, undefined) : undefined
      });
    });
    if (resultArray.length === items.length) {
      return resultArray;
    }
  } catch {
    return postItemDetailsWithRetries(items, retriesRemaining - 1);
  }

  return postItemDetailsWithRetries(items, retriesRemaining - 1);
};

export const awaitHydrationForItems = async (
  itemsAwaitingHydration: Array<TItemDetailRequestEntry>,
  retriesRemaining: number
): Promise<TAwaitedHyrdatedItemDetails> => {
  const hydratedItemDetails = new Array<TDetailEntry>();
  const newItemsAwaitingHydration = new Array<TItemDetailRequestEntry>();
  itemsAwaitingHydration.forEach(item => {
    const hydratedItemDetail = getItemDetail(item.id, item.itemType);
    if (
      hydratedItemDetail !== undefined &&
      hydratedItemDetail.status === ItemDetailsHydrationStatus.DETAILS_HYDRATED
    ) {
      hydratedItemDetails.push(hydratedItemDetail.details);
    } else {
      newItemsAwaitingHydration.push(item);
    }
  });

  if (newItemsAwaitingHydration.length > 0 && retriesRemaining > 0) {
    await sleep(itemDetailsHydrationServiceTimings.ITEM_DETAIL_LOAD_SLEEP_INTERVAL);

    const nextHydratedItemDetails = await awaitHydrationForItems(
      newItemsAwaitingHydration,
      retriesRemaining - 1
    );

    nextHydratedItemDetails.hydratedItemDetails = hydratedItemDetails.concat(
      nextHydratedItemDetails.hydratedItemDetails
    );

    return nextHydratedItemDetails;
  }
  const awaitedHydratedItemDetails = {
    hydratedItemDetails,
    nonHydratedItemDetails: newItemsAwaitingHydration
  } as TAwaitedHyrdatedItemDetails;
  return awaitedHydratedItemDetails;
};

export const awaitHydrationForCollectibleDetails = async (
  hydratedItemDetails: Array<TDetailEntry>,
  collectibleItemIds: Array<string>,
  retriesRemaining: number
): Promise<void> => {
  const newItemsAwaitingHydration = new Array<string>();
  for (let i = 0; i < collectibleItemIds.length; i++) {
    const itemDetailEntry = hydratedItemDetails.find(
      item => item.collectibleItemId === collectibleItemIds[i]
    );
    if (itemDetailEntry) {
      const hydratedItemDetail = getItemDetail(itemDetailEntry.id, itemDetailEntry.itemType);
      if (hydratedItemDetail && hydratedItemDetail.details.collectibleItemDetails === undefined) {
        newItemsAwaitingHydration.push(collectibleItemIds[i]);
      }
    }
  }

  if (newItemsAwaitingHydration.length > 0 && retriesRemaining > 0) {
    await sleep(itemDetailsHydrationServiceTimings.ITEM_DETAIL_LOAD_SLEEP_INTERVAL);

    await awaitHydrationForCollectibleDetails(
      hydratedItemDetails,
      newItemsAwaitingHydration,
      retriesRemaining - 1
    );
  }
};

export const getItemDetails = async (
  items: Array<TItemDetailRequestEntry>,
  cacheDetails?: boolean,
  hydrateCollectibleDetails?: boolean
): Promise<Array<TDetailEntry>> => {
  const blockCache = cacheDetails ?? false;
  cleanLocalStorage();

  const hydratedItemDetails = new Array<TDetailEntry>();
  const itemsRequiringHydration = new Array<TItemDetailRequestEntry>();
  const itemsAwaitingHydration = new Array<TItemDetailRequestEntry>();

  items.forEach(item => {
    const hydratedItemDetail = getItemDetail(item.id, item.itemType);
    if (hydratedItemDetail === null || hydratedItemDetail === undefined) {
      itemsRequiringHydration.push(item);
      createItemDetailHydrationEntry(item.id, item.itemType, blockCache);
    } else if (
      hydratedItemDetail.status === ItemDetailsHydrationStatus.DETAILS_LOADING ||
      hydratedItemDetail.status === ItemDetailsHydrationStatus.DETAILS_NOT_HYDRATED
    ) {
      if (
        Date.now() - hydratedItemDetail.lastModifiedTimestamp >
        itemDetailsHydrationServiceTimings.ITEM_DETAIL_LOAD_TIME_TO_LIVE
      ) {
        itemsRequiringHydration.push(item);
        createItemDetailHydrationEntry(item.id, item.itemType, blockCache);
      } else {
        itemsAwaitingHydration.push(item);
      }
    } else if (
      Date.now() - hydratedItemDetail.lastModifiedTimestamp >
      itemDetailsHydrationServiceTimings.ITEM_DETAIL_TIME_TO_LIVE
    ) {
      itemsRequiringHydration.push(item);
      createItemDetailHydrationEntry(item.id, item.itemType, blockCache);
    } else {
      hydratedItemDetails.push(hydratedItemDetail.details);
    }
  });

  if (itemsRequiringHydration.length > 0) {
    const hydratedItemsResult = await Promise.resolve(
      postItemDetailsWithRetries(itemsRequiringHydration, retriesForHydration)
    );
    if (hydratedItemsResult !== undefined) {
      hydratedItemsResult.forEach(item => {
        setItemDetailHydrationEntry(item.id, item.itemType, item, blockCache);
        hydratedItemDetails.push(item);
      });
    }
  }

  const awaitedHydratedItemDetails = await awaitHydrationForItems(
    itemsAwaitingHydration,
    retriesForHydration
  );
  awaitedHydratedItemDetails.hydratedItemDetails.forEach(item => {
    hydratedItemDetails.push(item);
  });

  if (awaitedHydratedItemDetails.nonHydratedItemDetails.length > 0) {
    const rehydratedItemsResult = await Promise.resolve(
      postItemDetailsWithRetries(itemsAwaitingHydration, retriesForHydration)
    );
    if (rehydratedItemsResult !== undefined) {
      rehydratedItemsResult.forEach(item => {
        setItemDetailHydrationEntry(item.id, item.itemType, item, blockCache);
        hydratedItemDetails.push(item);
      });
    }
  }
  const loadingCollectibleItemIds: Array<string> = new Array<string>();
  const awaitingCollectibleItemIds: Array<string> = new Array<string>();

  hydratedItemDetails.forEach(i => {
    const itemDetail = getItemDetail(i.id, i.itemType);
    const item = itemDetail?.details;
    if (item && item.collectibleItemId && item.collectibleItemDetails === undefined) {
      if (!item.collectibleItemDetailsLoading) {
        const newItem = { ...item, collectibleItemDetailsLoading: true };
        setItemDetailHydrationEntry(newItem.id, newItem.itemType, newItem, blockCache);
        loadingCollectibleItemIds.push(item.collectibleItemId);
      } else {
        awaitingCollectibleItemIds.push(item.collectibleItemId);
      }
    }
  });
  if (loadingCollectibleItemIds.length > 0 && hydrateCollectibleDetails) {
    const collectibleItemDetailsList = await Promise.resolve(
      postCollectibleItemDetails(loadingCollectibleItemIds)
    );
    for (let i = 0; i < collectibleItemDetailsList.data.length; i++) {
      const collectibleItemDetails = collectibleItemDetailsList.data[i];
      const itemDetailEntry = hydratedItemDetails.find(
        item => item.collectibleItemId === collectibleItemDetails.collectibleItemId
      );
      if (itemDetailEntry !== undefined) {
        collectibleItemDetails.purchaseInfo = getPurchaseInfo(
          itemDetailEntry,
          collectibleItemDetails
        );
        itemDetailEntry.collectibleItemDetails = collectibleItemDetails;
        setItemDetailHydrationEntry(
          itemDetailEntry.id,
          itemDetailEntry.itemType,
          itemDetailEntry,
          blockCache
        );
      }
    }
  }
  await awaitHydrationForCollectibleDetails(
    hydratedItemDetails,
    awaitingCollectibleItemIds,
    retriesForCollectiblesHydration
  );

  for (let i = 0; i < hydratedItemDetails.length; i++) {
    const curr = hydratedItemDetails[i];
    const detail = getItemDetail(curr.id, curr.itemType);
    if (detail) {
      curr.collectibleItemDetails = detail.details.collectibleItemDetails;
    }
  }

  return hydratedItemDetails;
};

export default {
  getItemDetails
};
