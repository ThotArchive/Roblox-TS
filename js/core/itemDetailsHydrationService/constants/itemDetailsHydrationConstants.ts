export type TItemDetailRequestEntry = {
  itemType: string;
  id: number;
};
export type TDetailResult = {
  data: Array<TDetailEntry>;
};
export type TBundledItem = {
  owned: boolean;
  id: number;
  name: string;
  type: string;
};

export type TItemDetailsCreatorType = 'Group' | 'User';

export type TPremiumPricing = {
  premiumDiscountPercentage?: number;
  premiumPriceInRobux?: number;
};

export type TCollectibleDetailEntry = {
  collectibleItemId?: string;
  collectibleProductId?: string;
  creatorHasVerifiedBadge: boolean;
  creatorId?: number;
  creatorName: string;
  creatorTargetId: number;
  creatorType: TItemDetailsCreatorType;
  description: string;
  expectedSellerId?: number;
  id: number;
  isPurchasable: boolean;
  itemRestrictions: string[];
  lowestPrice?: number;
  lowestResalePrice?: number;
  lowestAvailableResaleItemInstanceId?: string;
  lowestAvailableResaleProductId?: string;
  name: string;
  owned: boolean;
  premiumPricing?: TPremiumPricing;
  price: number;
  productId: number;
  totalQuantity?: number;
  unitsAvailableForConsumption?: number;
  saleLocationType?: string;
  isOffSale?: boolean;
  hasResellers?: boolean;
  quantityLimitPerUser?: number;
  resaleRestriction: number;
  purchaseInfo: THydratedMarketplacePurchaseInfo;
};

export type TDetailEntry = {
  itemType: string;
  id: number;
  collectibleItemId: string;
  assetType: number;
  bundleType: number;
  name: string;
  description: string;
  productId: number;
  genres: number[];
  bundledItems: TBundledItem[];
  itemStatus: string[];
  itemRestrictions: string[];
  creatorHasVerifiedBadge: boolean;
  creatorType: string;
  creatorTargetId: number;
  creatorName: string;
  price?: number;
  premiumPricing?: {
    premiumDiscountPercentage: number;
    premiumPriceInRobux: number;
  };
  lowestPrice?: number;
  priceStatus?: string;
  unitsAvailableForConsumption: number;
  purchaseCount: number;
  favoriteCount: number;
  offSaleDeadline: string;
  totalQuantity: number;
  saleLocationType: string;
  hasResellers: boolean;
  isOffSale: boolean;
  collectibleItemDetails: TCollectibleDetailEntry;
  collectibleItemDetailsLoading: boolean;
  purchaseInfo?: THydratedMarketplacePurchaseInfo;
};

export type THydratedMarketplacePurchaseInfo = {
  purchasable: boolean;
  ownershipLimit?: number;
  purchasePrice?: number;
  purchaseFromReseller?: boolean;
};

export enum ItemDetailsHydrationStatus {
  DETAILS_NOT_HYDRATED = 0,
  DETAILS_LOADING = 1,
  DETAILS_HYDRATED = 2
}

export type TCachedItemDetailsHydratedEntry = {
  details: TDetailEntry;
  status: ItemDetailsHydrationStatus;
  lastModifiedTimestamp: number;
};

export type TCachedItemDetails = {
  data: Record<number, TCachedItemDetailsHydratedEntry>;
};

export const itemDetailsHydrationServiceTimings = {
  ITEM_DETAIL_TIME_TO_LIVE: 10000,
  ITEM_DETAIL_LOAD_TIME_TO_LIVE: 1000,
  ITEM_DETAIL_CACHE_CLEAR_TIME_TO_LIVE: 10000,
  ITEM_DETAIL_LOAD_MAX_WAIT_TIME: 5000,
  ITEM_DETAIL_LOAD_SLEEP_INTERVAL: 500
};

export const itemTypes = {
  asset: 'asset',
  bundle: 'bundle'
};

export type TAwaitedHyrdatedItemDetails = {
  hydratedItemDetails: Array<TDetailEntry>;
  nonHydratedItemDetails: Array<TDetailEntry>;
};

export type TAwaitedHydratedCollectibleDetails = {
  hydratedCollectibleIds: Array<string>;
  nonHydratedCollectibleIds: Array<string>;
};

export const retriesForHydration = 3;
export const retriesForCollectiblesHydration = 5;
