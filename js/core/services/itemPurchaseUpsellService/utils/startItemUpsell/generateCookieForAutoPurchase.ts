import { uuidService } from 'core-utilities';
import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { upsellUtil } from 'core-roblox-utilities';
import {
  ItemDetailElementDataset,
  ItemPurchaseAjaxDataObject
} from '../../constants/serviceTypeDefinitions';

export default function generateCookieForAutoPurchase(
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemPurchaseObj?: ItemDetailElementDataset
) {
  const pathMatches: RegExpMatchArray | null = upsellUtil.constants.UPSELL_TARGET_ITEM_URL_REGEX.exec(
    window.location.pathname
  );
  upsellUtil.constants.UPSELL_TARGET_ITEM_URL_REGEX.lastIndex = 0; // regex pointer rewind

  let assetUrl: string | null = null;
  if (Array.isArray(pathMatches) && pathMatches.length > 0) {
    [assetUrl] = pathMatches;
  }
  if (!assetUrl) {
    return '';
  }
  if (!itemPurchaseObj || Object.keys(itemPurchaseObj).length < 4) {
    return '';
  }
  const upsellUuid = uuidService.generateRandomUuid();
  // we should use this one over the same data from item container, because there are multiple buy buttons on collectible items page for different resellers
  // DEFINE: purchaseMetadata = "ExpectedCurrency,ExpectedPrice,ExpectedSellerId,UserAssetId,"
  // The reason we put these 4 here is:
  //  The first 4 are used for the purchase api and resellers might have different prices. The 4th one is only useful for reseller for now.
  // The order of this sequence matters
  const purchaseMetadata = `${itemPurchaseObj.expectedCurrency},${itemPurchaseObj.expectedPrice},${
    itemPurchaseObj.expectedSellerId
  },${itemPurchaseObj.userassetId ?? ''}`;
  // auto purchase will need the following data to show the purchase success modal
  //  DEFINE: autoPurchaseRequiredData = "ProductId"
  //  - ProductId: used for the purchased callback && the NEW purchase API
  //    we will use product id to get the item id, item name and thumbnail
  //      - assetType: asset type like gears, bundle, game pass, private server
  //      - ItemId: used for the analytics and thumbnail get
  //      - Thumbnail Image Url: used for showing the auto purchase success modal
  //      - Item Name: used for showing the auto purchase success modal
  // Beware: catalog resellers have the same product id, thus, userAssetId, expected prices, id could not get from API.
  //         However, on the game page, different buy button have different product id for game passes on the game page
  const autoPurchaseRequiredData = `${itemPurchaseObj.productId || ''}`;
  const cookieData = `${upsellUuid},${assetUrl},${CurrentUser.userId},${purchaseMetadata},${autoPurchaseRequiredData}`;
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  const cookie = [
    upsellUtil.constants.UPSELL_COOKIE_KEY,
    '=',
    encodeURIComponent(cookieData),
    `; expires=${expires.toUTCString()}`,
    '; path=/',
    '; domain=.',
    EnvironmentUrls.domain,
    ';'
  ];
  document.cookie = cookie.join('');

  return upsellUuid;
}
