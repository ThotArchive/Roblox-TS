import itemPurchaseConstants from '../constants/itemPurchaseConstants';

const parseItemDetails = (originalItem, data) => {
  const item = {
    ...originalItem,
    expectedSellerId: data.expectedSellerId,
    owned: data.owned,
    id: data.id,
    itemType: data.itemType,
    assetType: data.assetType,
    name: data.name,
    description: data.description,
    productId: data.productId,
    price: data.price,
    lowestPrice: data.lowestPrice,
    creatorTargetId: data.creatorTargetId,
    creatorName: data.creatorName,
    hasLimitedPrivateSales: data.lowestPrice !== undefined,
    isPublicDomain: data.price === 0,
    offSaleDeadline: data.offSaleDeadline,
    isLimited:
      data.itemRestrictions.includes('Limited') || data.itemRestrictions.includes('LimitedUnique'),
    collectibleItemId: data.collectibleItemId,
    collectibleItemDetails: data.collectibleItemDetails,
    unitsAvailableForConsumption:
      data.unitsAvailableForConsumption !== undefined ? data.unitsAvailableForConsumption : 0,
    priceStatus: data.priceStatus ?? data.priceStatus,
    itemRestrictions: data.itemRestrictions
  };
  if (data.premiumPricing !== undefined) {
    item.premiumPriceInRobux = data.premiumPricing.premiumPriceInRobux;
    item.premiumDiscountPercentage = data.premiumPricing.premiumDiscountPercentage;
  }
  if (item.isLimited) {
    item.price = item.lowestPrice !== undefined ? item.lowestPrice : item.price;
  }

  if (item.collectibleItemId !== undefined) {
    item.resellerAvailable = data.hasResellers;
    item.isPurchasable = data.lowestPrice !== undefined;
    item.isMarketPlaceEnabled =
      data.saleLocationType === 'ShopAndAllExperiences' || data.saleLocationType === 'ShopOnly';
  }

  return item;
};

const parseResellerDetails = (originalItem, data) => {
  const item = { ...originalItem };
  item.resellerAvailable = data.data.data.length > 0;
  if (item.resellerAvailable) {
    const [reseller] = data.data.data;
    item.price = reseller.price;
    item.firstReseller = reseller;
  }

  return item;
};

const parseItemPurchasableDetails = (originalItem, data, economyMetadata) => {
  const { errorMessages } = itemPurchaseConstants;
  const item = { ...originalItem };
  if (
    !data.purchasable &&
    data.reason &&
    data.reason !== errorMessages.insufficientFunds &&
    data.reason !== errorMessages.twoStepVerificationRequired
  ) {
    item.isPurchasable = data.purchasable;
  } else if (
    !data.purchasable &&
    data.reason &&
    data.reason === errorMessages.twoStepVerificationRequired
  ) {
    item.twoStepVerificationRequired = true;
    item.isPurchasable = true;
  } else {
    item.isPurchasable = true;
  }
  item.assetTypeDisplayName = data.assetTypeDisplayName;
  item.loading = false;
  item.loadFailure = false;
  item.isMarketPlaceEnabled =
    economyMetadata.data.isMarketPlaceEnabled && economyMetadata.data.isItemsXchangeEnabled;

  return item;
};

const parseItemPurchasableNonAuthDetails = originalItem => {
  const item = { ...originalItem };
  item.isPurchasable = false;

  return item;
};

export default {
  parseItemDetails,
  parseResellerDetails,
  parseItemPurchasableDetails,
  parseItemPurchasableNonAuthDetails
};
