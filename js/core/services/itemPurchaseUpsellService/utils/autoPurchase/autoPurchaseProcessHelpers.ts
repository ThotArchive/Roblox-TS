import { escapeHtml } from 'core-utilities';
import { upsellUtil } from 'core-roblox-utilities';
import { MetaDataValues } from 'Roblox';
import { redirectToCatalogShop, redirectToItemPath } from '../common/redirectionHelpers';
import {
  ItemDetailElementDataset,
  ItemPurchaseAjaxDataObject,
  ItemPurchaseObject,
  ProductInfo
} from '../../constants/serviceTypeDefinitions';
import {
  BUNDLE_ITEM_PAGE_PREFIX,
  CATALOG_ITEM_PAGE_PREFIX,
  GAME_PASS_DETAIL_PAGE_PREFIX,
  GAMES_PAGE_PREFIX,
  ITEM_UPSELL_EVENTS,
  UPSELL_COUNTER_NAMES,
  UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER
} from '../../constants/upsellConstants';
import reportCounter from '../common/reportCounter';
import getProductInfo from '../../api/getProductInfo';
import { invalidateCurrentAutoPurchaseFlow } from '../common/invalidationHelpers';
import getThumbnailUrl from '../../api/getThumbnailUrl';
import sendEvent from '../common/sendEvent';

function stopAndRedirectDueToSuspiciousBehavior(itemPath: string) {
  invalidateCurrentAutoPurchaseFlow();
  redirectToItemPath(itemPath);
}

export function validateEnvSettings(itemPath: string): void {
  if (
    !itemPath ||
    !(
      itemPath.startsWith(CATALOG_ITEM_PAGE_PREFIX) ||
      itemPath.startsWith(BUNDLE_ITEM_PAGE_PREFIX) ||
      itemPath.startsWith(GAME_PASS_DETAIL_PAGE_PREFIX) ||
      itemPath.startsWith(GAMES_PAGE_PREFIX)
    ) ||
    itemPath.includes('UpsellUuid=') // should not have uuid here
  ) {
    redirectToCatalogShop();
  }
}

async function getProductIdWrapper(itemPath: string, productId?: string): Promise<ProductInfo> {
  if (!productId) {
    return Promise.reject();
  }
  try {
    const productInfo = await getProductInfo(productId);

    if (!productInfo || Object.keys(productInfo).length === 0) {
      reportCounter(
        UPSELL_COUNTER_NAMES.AutoPurchasePotentialHackingActionSpotted3,
        UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER
      );
      sendEvent(ITEM_UPSELL_EVENTS.CONTEXT_NAME.PRODUCT_INFO_EMPTY, {
        itemPath,
        productId
      });
      return Promise.reject();
    }

    return productInfo;
  } catch (e) {
    reportCounter(
      UPSELL_COUNTER_NAMES.AutoPurchasePotentialHackingActionSpotted4,
      UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER
    );
    sendEvent(ITEM_UPSELL_EVENTS.CONTEXT_NAME.PRODUCT_INFO_REQUEST_FAILED, {
      itemPath,
      productId,
      error: e as unknown
    });
    return Promise.reject(e);
  }
}

async function validateAndGetDataObject(
  itemPath: string,
  itemPurchaseDataElementMap: DOMStringMap | undefined,
  itemDetailDataElementMap: DOMStringMap | undefined
): Promise<[ItemPurchaseAjaxDataObject, ItemDetailElementDataset]> {
  const cookieData = upsellUtil.parseUpsellCookie();
  if (
    !cookieData ||
    Object.keys(cookieData).length === 0 ||
    (cookieData.targetItemUrl && !itemPath.startsWith(cookieData.targetItemUrl))
  ) {
    reportCounter(
      UPSELL_COUNTER_NAMES.AutoPurchasePotentialHackingActionSpotted2,
      UPSELL_COUNTER_NO_TYPE_PARSED_PLACEHOLDER
    );
    sendEvent(ITEM_UPSELL_EVENTS.CONTEXT_NAME.COOKIE_PARSE_FAILED, {
      itemPath,
      upsellCookieData: cookieData
    });
    stopAndRedirectDueToSuspiciousBehavior(itemPath);
  }
  const itemPurchaseAjaxData = itemPurchaseDataElementMap as ItemPurchaseAjaxDataObject | undefined;

  if (!itemPurchaseAjaxData) {
    stopAndRedirectDueToSuspiciousBehavior(itemPath);
  }

  let productInfo;
  try {
    // It is a known issue that Item-Hydration service returns incorrect productId for collectible items which is propogated to the cookie.
    // For Collectible Items, we need to use productId from the itemDetailDataElementMap
    const productId =
      cookieData.collectibleItemId == null
        ? cookieData.productId
        : itemDetailDataElementMap?.productId;

    productInfo = await getProductIdWrapper(itemPath, productId);
  } catch (e) {
    sendEvent(ITEM_UPSELL_EVENTS.CONTEXT_NAME.PRODUCT_ID_NOT_EXIST, {
      itemPath,
      upsellCookieData: cookieData,
      error: e as unknown
    });
    stopAndRedirectDueToSuspiciousBehavior(itemPath);
    return Promise.reject(); // won't run return but put this line here to avoid productInfo nullable check
  }
  const thumbnailUrl = await getThumbnailUrl(productInfo.assetId, productInfo.assetType);

  itemPurchaseAjaxData!.imageurl = thumbnailUrl || itemPurchaseAjaxData!.imageurl;
  // We shall use the cookie data to make sure the correct buy button is used on the page for:
  //  expectedCurrency, expectedPrice, expectedSellerId, userAssetId, assetType
  // The fail-over, like ` || '1'`, is set according to how the cshtml behave
  // reason not use { ...itemDetailDataElementMap, ...cookieData } is some keys are different
  const itemDetailData = {
    expectedPrice: cookieData.expectedPrice || '0',
    expectedCurrency: cookieData.expectedCurrency || '1',
    expectedSellerId: cookieData.expectedSellerId || '',
    itemId: productInfo.assetId || itemDetailDataElementMap?.itemId,
    itemName: productInfo.assetName || itemDetailDataElementMap?.itemName,
    assetType: productInfo.assetType || itemDetailDataElementMap?.assetType,
    assetGranted: itemDetailDataElementMap?.assetGranted,
    assetTypeDisplayName:
      productInfo.assetTypeDisplayName || itemDetailDataElementMap?.assetTypeDisplayName,
    assetTypeId: itemDetailDataElementMap?.assetTypeId,
    productId: productInfo.productId || cookieData.productId || itemDetailDataElementMap?.productId,
    itemType: productInfo.assetType || itemDetailDataElementMap?.itemType,
    currentTime: itemDetailDataElementMap?.currentTime,
    isPurchaseEnabled: itemDetailDataElementMap?.isPurchaseEnabled,
    placeproductpromotionId: itemDetailDataElementMap?.placeproductpromotionId,
    userassetId: cookieData.userAssetId || itemDetailDataElementMap?.userassetId,
    collectibleItemId: cookieData.collectibleItemId || itemDetailDataElementMap?.collectibleItemId,
    collectibleItemInstanceId:
      cookieData.collectibleItemInstanceId || itemDetailDataElementMap?.collectibleItemInstanceId,
    collectibleProductId:
      cookieData.collectibleProductId || itemDetailDataElementMap?.collectibleProductId
  } as ItemDetailElementDataset;

  if (!itemDetailData) {
    redirectToItemPath(itemPath);
  }
  return [itemPurchaseAjaxData!, itemDetailData];
}

export async function preProcessData(
  itemContainerElement: HTMLElement | null,
  itemDetailDataElementMap: DOMStringMap | undefined,
  itemPurchaseDataElementMap: DOMStringMap | undefined,
  itemPath: string
): Promise<ItemPurchaseObject> {
  const [itemPurchaseAjaxData, itemDetail] = await validateAndGetDataObject(
    itemPath,
    itemPurchaseDataElementMap,
    itemDetailDataElementMap
  ); // Get data from elements
  const expPromoId = itemDetail.placeproductpromotionId;
  const context = (MetaDataValues && MetaDataValues.getPageName()) || '';
  const isLibrary = context === 'LibraryItem';
  const userBalance = parseInt(itemPurchaseAjaxData.userBalanceRobux, 10);
  const expCurrency = parseInt(itemDetail.expectedCurrency, 10);
  const expPrice = parseInt(itemDetail.expectedPrice, 10);
  const expSellerId = parseInt(itemDetail.expectedSellerId, 10);

  const item = {
    itemContainerElemClassList: itemContainerElement?.classList,
    assetType: itemDetail.assetType,
    assetName: escapeHtml()(itemDetail.itemName),
    expectedSellerId: expSellerId,
    expectedCurrency: expCurrency,
    expectedPrice: expPrice,
    productId: itemDetail.productId,
    isLibrary,
    itemThumbnailUrl: itemPurchaseAjaxData.imageurl,
    itemPath,
    alertImageUrl: itemPurchaseAjaxData.alerturl,
    userBalance,
    itemPurchaseAjaxData,
    itemDetail
  } as ItemPurchaseObject;

  if (expPromoId) {
    item.expectedPromoId = parseInt(expPromoId, 10);
  }
  if (itemDetail.userassetId) {
    item.userAssetId = parseInt(itemDetail.userassetId, 10);
  }
  return item;
}
