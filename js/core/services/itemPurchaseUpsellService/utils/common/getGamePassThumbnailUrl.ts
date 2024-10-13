import { ItemDetailElementDataset } from '../../constants/serviceTypeDefinitions';

const getGamePassThumbnailUrl = (
  buyButtonElementDataset: ItemDetailElementDataset
): string | null => {
  const buyButtonElement = document.querySelector(
    `.PurchaseButton[data-product-id="${buyButtonElementDataset.productId}"]`
  );
  const storeItemCard = buyButtonElement?.closest('.store-card');
  const gamePassImg = storeItemCard?.querySelector('.gear-passes-asset img');
  if (gamePassImg) {
    return (gamePassImg as HTMLImageElement).src;
  }
  return null;
};

export default getGamePassThumbnailUrl;
