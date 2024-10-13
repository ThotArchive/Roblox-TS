import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const {
  getItemDetailsUrl,
  postItemDetailsUrl,
  getPurchaseableDetailUrl,
  getResellerDataUrl,
  getMetaDataUrl,
  getCollectibleItemDetailsUrl,
  getCurrentUserBalance
} = urlConstants;

export default {
  getItemDetails: (itemId, itemType) => {
    const urlConfig = {
      url: getItemDetailsUrl(itemId, itemType),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  postItemDetails: items => {
    const urlConfig = {
      url: postItemDetailsUrl(),
      retryable: true,
      withCredentials: true
    };
    const params = {
      items
    };
    return httpService.post(urlConfig, params);
  },
  getItemPurchasableDetail: productId => {
    const urlConfig = {
      url: getPurchaseableDetailUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  getResellerDetail: assetId => {
    const urlConfig = {
      url: getResellerDataUrl(assetId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  getEconomyMetadata: () => {
    const urlConfig = {
      url: getMetaDataUrl(),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  async getCollectibleItemDetails(collectibleItemId) {
    const urlConfig = {
      url: getCollectibleItemDetailsUrl(),
      retryable: true,
      withCredentials: true
    };
    const requestBody = {
      itemIds: [collectibleItemId]
    };
    const result = await httpService.post(urlConfig, requestBody);
    return result.data?.[0] || null;
  },
  getCurrentUserBalance: userId => {
    const urlConfig = {
      url: getCurrentUserBalance(userId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  }
};
