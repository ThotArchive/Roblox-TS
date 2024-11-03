import { localStorageService } from 'core-roblox-utilities';
import {
  TCachedItemDetailsHydratedEntry,
  TDetailEntry,
  ItemDetailsHydrationStatus,
  itemDetailsHydrationServiceTimings,
  itemTypes,
  TCollectibleDetailEntry,
  THydratedMarketplacePurchaseInfo
} from '../constants/itemDetailsHydrationConstants';

const getLocalStorageKey = (id: number, itemType: string): string => {
  return `ITEM_DETAILS_HYDRATION_${itemType.toUpperCase()}_${id}`;
};

const getLocalStorageItemTrackingKey = (itemType: string): string => {
  return `ITEM_DETAILS_HYDRATION_${itemType.toUpperCase()}_TRACKING`;
};

const createItemDetailsTrackingList = (itemType: string): Array<number> => {
  const newItemDetailsTrackingList = new Array<number>();
  localStorageService.setLocalStorage(
    getLocalStorageItemTrackingKey(itemType),
    newItemDetailsTrackingList
  );

  return newItemDetailsTrackingList;
};

const getLocalStorageItemTrackingList = (itemType: string): Array<number> | undefined => {
  try {
    return localStorageService.getLocalStorage(getLocalStorageItemTrackingKey(itemType)) as
      | undefined
      | Array<number>;
  } catch {
    return undefined;
  }
};

const addItemToLocalStorageItemTrackList = (itemType: string, id: number): void => {
  let itemDetailsTrackingList = getLocalStorageItemTrackingList(itemType);
  if (itemDetailsTrackingList === undefined || itemDetailsTrackingList === null) {
    itemDetailsTrackingList = createItemDetailsTrackingList(itemType);
  }
  itemDetailsTrackingList.push(id);
  localStorageService.setLocalStorage(
    getLocalStorageItemTrackingKey(itemType),
    itemDetailsTrackingList
  );
};

export const getItemDetail = (
  id: number,
  itemType: string
): TCachedItemDetailsHydratedEntry | undefined => {
  try {
    return localStorageService.getLocalStorage(getLocalStorageKey(id, itemType)) as
      | undefined
      | TCachedItemDetailsHydratedEntry;
  } catch {
    return undefined;
  }
};

export const createItemDetailHydrationEntry = (
  id: number,
  itemType: string,
  blockCache?: boolean
): void => {
  if (blockCache) {
    return;
  }
  const newItemDetailEntry = {} as TCachedItemDetailsHydratedEntry;
  newItemDetailEntry.status = ItemDetailsHydrationStatus.DETAILS_LOADING;
  newItemDetailEntry.lastModifiedTimestamp = Date.now();

  localStorageService.setLocalStorage(getLocalStorageKey(id, itemType), newItemDetailEntry);
  addItemToLocalStorageItemTrackList(itemType, id);
};

export const setItemDetailHydrationEntry = (
  id: number,
  itemType: string,
  itemDetails: TDetailEntry,
  blockCache?: boolean
): void => {
  if (blockCache) {
    return;
  }
  const newItemDetailEntry = {} as TCachedItemDetailsHydratedEntry;
  newItemDetailEntry.status = ItemDetailsHydrationStatus.DETAILS_HYDRATED;
  newItemDetailEntry.details = itemDetails;
  newItemDetailEntry.lastModifiedTimestamp = Date.now();
  localStorageService.setLocalStorage(getLocalStorageKey(id, itemType), newItemDetailEntry);

  addItemToLocalStorageItemTrackList(itemType, id);
};

const cleanLocalStorageForItemType = (itemType: string): void => {
  const localStorageTrackingList = getLocalStorageItemTrackingList(itemType);
  const keptCachedItems = new Array<number>();
  if (localStorageTrackingList !== undefined && localStorageTrackingList !== null) {
    localStorageTrackingList.forEach(item => {
      const cachedItemDetal = getItemDetail(item, itemType);
      if (
        cachedItemDetal?.lastModifiedTimestamp === undefined ||
        Date.now() - cachedItemDetal?.lastModifiedTimestamp >
          itemDetailsHydrationServiceTimings.ITEM_DETAIL_CACHE_CLEAR_TIME_TO_LIVE
      ) {
        localStorageService.removeLocalStorage(getLocalStorageKey(item, itemType));
      } else {
        keptCachedItems.push(item);
      }
    });
  }

  localStorageService.setLocalStorage(getLocalStorageItemTrackingKey(itemType), keptCachedItems);
};

export const cleanLocalStorage = (): void => {
  cleanLocalStorageForItemType(itemTypes.asset);
  cleanLocalStorageForItemType(itemTypes.bundle);
};

export const sleep = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(undefined), milliseconds));

export const getItemPurchasable = (
  itemDetail: TDetailEntry,
  collectibleItemDetail?: TCollectibleDetailEntry
): boolean => {
  if (itemDetail.isOffSale) {
    return false;
  }
  if (
    itemDetail.itemRestrictions.includes('Limited') ||
    itemDetail.itemRestrictions.includes('LimitedUnique')
  ) {
    if (itemDetail.hasResellers !== true) {
      return false;
    }
  }
  if (itemDetail.collectibleItemId && collectibleItemDetail) {
    if (collectibleItemDetail === undefined) {
      return false;
    }
    if (
      collectibleItemDetail.unitsAvailableForConsumption === 0 &&
      collectibleItemDetail.hasResellers === false &&
      itemDetail.itemRestrictions.includes('Collectible')
    ) {
      return false;
    }
    const useLowestReseller =
      itemDetail.collectibleItemId !== undefined &&
      itemDetail.itemRestrictions.includes('Collectible') &&
      collectibleItemDetail.hasResellers === true &&
      (collectibleItemDetail.unitsAvailableForConsumption === 0 ||
        (collectibleItemDetail.lowestResalePrice &&
          collectibleItemDetail.lowestResalePrice !== 0 &&
          collectibleItemDetail.lowestResalePrice < collectibleItemDetail.price) ||
        collectibleItemDetail.saleLocationType === 'ExperiencesDevApiOnly');
    if (!useLowestReseller && collectibleItemDetail.saleLocationType === 'ExperiencesDevApiOnly') {
      return false;
    }
  }

  if (itemDetail.isOffSale) {
    return false;
  }
  return true;
};

export const getOwnershipLimit = (
  itemDetail: TDetailEntry,
  collectibleItemDetail?: TCollectibleDetailEntry
): number | undefined => {
  if (
    itemDetail.itemRestrictions.includes('Limited') ||
    itemDetail.itemRestrictions.includes('LimitedUnique')
  ) {
    return undefined;
  }
  if (itemDetail.collectibleItemId && collectibleItemDetail) {
    if (itemDetail.itemRestrictions.includes('Collectible')) {
      if (
        collectibleItemDetail.unitsAvailableForConsumption === 0 ||
        collectibleItemDetail.quantityLimitPerUser === 0
      ) {
        return undefined;
      }
    } else if (collectibleItemDetail.quantityLimitPerUser !== 0) {
      return collectibleItemDetail.quantityLimitPerUser;
    }
  }
  return 1;
};

export const getPurchasePrice = (
  itemDetail: TDetailEntry,
  collectibleItemDetail?: TCollectibleDetailEntry
): number | undefined => {
  if (itemDetail.isOffSale) {
    return undefined;
  }
  if (
    itemDetail.itemRestrictions.includes('Limited') ||
    itemDetail.itemRestrictions.includes('LimitedUnique')
  ) {
    return undefined;
  }
  if (itemDetail.collectibleItemId && collectibleItemDetail) {
    if (itemDetail.itemRestrictions.includes('Collectible')) {
      const useLowestReseller =
        itemDetail.collectibleItemId !== undefined &&
        itemDetail.itemRestrictions.includes('Collectible') &&
        (collectibleItemDetail.unitsAvailableForConsumption === 0 ||
          (collectibleItemDetail.lowestResalePrice &&
            collectibleItemDetail.lowestResalePrice !== 0 &&
            collectibleItemDetail.lowestResalePrice < collectibleItemDetail.price) ||
          collectibleItemDetail.saleLocationType === 'ExperiencesDevApiOnly');
      if (useLowestReseller) {
        if (collectibleItemDetail.lowestResalePrice === 0) {
          return undefined;
        }
        return collectibleItemDetail.lowestResalePrice;
      }
      return collectibleItemDetail.price;
    }
    if (collectibleItemDetail.saleLocationType === 'ExperiencesDevApiOnly') {
      return undefined;
    }
    return collectibleItemDetail.price;
  }
  return itemDetail.price;
};

export const getPurchaseFromReseller = (
  itemDetail: TDetailEntry,
  collectibleItemDetail?: TCollectibleDetailEntry
): boolean => {
  if (
    itemDetail.itemRestrictions.includes('Limited') ||
    itemDetail.itemRestrictions.includes('LimitedUnique')
  ) {
    return true;
  }
  if (itemDetail.collectibleItemId && collectibleItemDetail) {
    const useLowestReseller =
      itemDetail.collectibleItemId !== undefined &&
      itemDetail.itemRestrictions.includes('Collectible') &&
      collectibleItemDetail.hasResellers === true &&
      (collectibleItemDetail.unitsAvailableForConsumption === 0 ||
        (collectibleItemDetail.lowestResalePrice !== 0 &&
          collectibleItemDetail.lowestResalePrice &&
          collectibleItemDetail.lowestResalePrice < collectibleItemDetail.price) ||
        collectibleItemDetail.saleLocationType === 'ExperiencesDevApiOnly');

    return useLowestReseller;
  }
  return false;
};

export const getPurchaseInfo = (
  itemDetail: TDetailEntry,
  collectibleItemDetail?: TCollectibleDetailEntry
): THydratedMarketplacePurchaseInfo => {
  return {
    purchasable: getItemPurchasable(itemDetail, collectibleItemDetail),
    ownershipLimit: getOwnershipLimit(itemDetail, collectibleItemDetail),
    purchasePrice: getPurchasePrice(itemDetail, collectibleItemDetail),
    purchaseFromReseller: getPurchaseFromReseller(itemDetail, collectibleItemDetail)
  } as THydratedMarketplacePurchaseInfo;
};

export default {
  getLocalStorageKey,
  getItemDetail,
  createItemDetailHydrationEntry,
  setItemDetailHydrationEntry,
  cleanLocalStorage,
  sleep,
  getItemPurchasable,
  getOwnershipLimit,
  getPurchasePrice,
  getPurchaseInfo
};
