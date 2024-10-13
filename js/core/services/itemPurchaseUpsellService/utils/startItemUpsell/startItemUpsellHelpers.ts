import {
  ItemDetailElementDataset,
  ItemPurchaseAjaxDataObject
} from '../../constants/serviceTypeDefinitions';
import reportCounter from '../common/reportCounter';
import { GAMES_PAGE_PREFIX, UPSELL_COUNTER_NAMES } from '../../constants/upsellConstants';
import getGamePassThumbnailUrl from '../common/getGamePassThumbnailUrl';

const PreProcessThumbnailUrl = (
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  buyButtonElementDataset?: ItemDetailElementDataset,
  itemPath: string = window.location.pathname
) => {
  if (itemPath.includes(GAMES_PAGE_PREFIX)) {
    if (!buyButtonElementDataset) {
      throw new Error('button data not exist');
    }
    reportCounter(UPSELL_COUNTER_NAMES.UpsellFromGamesPage, buyButtonElementDataset.assetType);
    const thumbnailUrl = getGamePassThumbnailUrl(buyButtonElementDataset);
    if (!thumbnailUrl) {
      reportCounter(
        UPSELL_COUNTER_NAMES.UpsellThumbnailProcessFailed,
        buyButtonElementDataset.assetType
      );
      throw new Error('thumbnail image url process failed');
    }
    return thumbnailUrl;
  }
  return itemPurchaseAjaxData.imageurl;
};

export default PreProcessThumbnailUrl;
