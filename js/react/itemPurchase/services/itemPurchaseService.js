import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const {
  getPurchaseItemUrl,
  getPurchaseCollectibleItemUrl,
  getPurchaseCollectibleItemInstanceUrl,
  postBulkPurchaseUrl,
  postPurchaseDeveloperProductUrl
} = urlConstants;

export default {
  purchaseCollectibleItem: (collectibleItemId, params) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  purchaseCollectibleItemInstance: (collectibleItemId, params) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemInstanceUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  purchaseDeveloperProduct: (productId, request) => {
    const urlConfig = postPurchaseDeveloperProductUrl(productId.toString());
    return httpService.post(urlConfig, request);
  },
  purchaseItem: (productId, params) => {
    const urlConfig = {
      url: getPurchaseItemUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  bulkPurchaseItem: (userId, productSurface, fulfillmentGroups, idempotencyKey) => {
    const urlConfig = {
      url: `${postBulkPurchaseUrl()}?idempotencyKey.key=${idempotencyKey}`,
      retryable: true,
      withCredentials: true
    };
    const params = {
      purchasingUser: `users/${userId}`,
      context: { productSurface },
      fulfillmentGroups: [fulfillmentGroups]
    };
    return httpService.post(urlConfig, params);
  }
};
