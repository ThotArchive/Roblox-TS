import { EnvironmentUrls } from 'Roblox';

export const urlConfigs = {
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles',
  getRecommendations: {
    url: `${EnvironmentUrls.catalogApi}/v2/recommendations/complement-assets`,
    retryable: true,
    withCredentials: true
  },
  postItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true
  },
  postCollectibleItemDetails: {
    url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-items/v1/items/details`,
    retryable: true,
    withCredentials: true
  },
  getItemOwnershipUrl: (userId: number, itemType: string, itemTargetId: number): string =>
    `${EnvironmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemTargetId}/is-owned`
};

export default urlConfigs;
