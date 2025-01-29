import { CurrentUser, EnvironmentUrls } from 'Roblox';
import urlService from '../../services/urlService';
import {
  UPSELL_COOKIE_KEY,
  UPSELL_COOKIE_KEY_REGEX,
  UPSELL_QUERY_PARAM_KEY,
  UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX,
  UPSELL_TARGET_ITEM_URL_REGEX
} from './upsellConstant';

function expireUpsellCookie() {
  const expiredUpsellCookieStr = `${UPSELL_COOKIE_KEY}=;path=/;domain=.${EnvironmentUrls.domain};expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  if (document.cookie.includes(UPSELL_COOKIE_KEY)) {
    document.cookie = expiredUpsellCookieStr;
  }
}

function parseUpsellCookie() {
  const catalogUpsellData = UPSELL_COOKIE_KEY_REGEX.exec(document.cookie);
  const upsellUuidFromQuery = urlService.getQueryParam(UPSELL_QUERY_PARAM_KEY);
  if (!Array.isArray(catalogUpsellData) || catalogUpsellData.length !== 2 || !upsellUuidFromQuery) {
    expireUpsellCookie();
    return {};
  }

  const upsellData = decodeURIComponent(catalogUpsellData[1]).split(',');
  if (upsellData.length !== 11) {
    expireUpsellCookie();
    return {};
  }

  const upsellUuidFromCookie = upsellData[0];
  const targetItemUrl = upsellData[1];
  const userId = upsellData[2];
  const expectedCurrency = upsellData[3];
  const expectedPrice = upsellData[4];
  const expectedSellerId = upsellData[5];
  const userAssetId = upsellData[6] || undefined; // only is useful for resellers
  const productId = upsellData[7] || undefined;

  // Needed for collectible items
  const collectibleItemId = upsellData[8] || undefined;
  const collectibleItemInstanceId = upsellData[9] || undefined;
  const collectibleProductId = upsellData[10] || undefined;

  const itemUrlValid = UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX.exec(targetItemUrl);
  UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX.lastIndex = 0; // reset regex
  if (
    upsellUuidFromQuery === upsellUuidFromCookie &&
    CurrentUser.userId === userId &&
    itemUrlValid
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const returnUrl = urlService.formatUrl({
      pathname: targetItemUrl,
      query: { [UPSELL_QUERY_PARAM_KEY]: upsellUuidFromCookie }
    });
    return {
      upsellUuid: upsellUuidFromCookie,
      targetItemUrl,
      userId,
      returnUrl,
      expectedCurrency,
      expectedPrice,
      expectedSellerId,
      userAssetId,
      productId,
      collectibleItemId,
      collectibleItemInstanceId,
      collectibleProductId
    };
  }

  expireUpsellCookie();
  return {};
}

function getUpsellUuid() {
  const upsellUuid = urlService.getQueryParam(UPSELL_QUERY_PARAM_KEY);
  if (!upsellUuid && document.cookie.includes(UPSELL_COOKIE_KEY)) {
    // cookie exists but query param doesn't
    expireUpsellCookie();
    return undefined;
  }
  if (upsellUuid && document.cookie.includes(UPSELL_COOKIE_KEY)) {
    const cookieData = parseUpsellCookie();
    if (upsellUuid !== cookieData.upsellUuid) {
      // cookie uuid and query param mismatch
      expireUpsellCookie();
      return undefined;
    }
  }

  return upsellUuid;
}

export default {
  expireUpsellCookie,
  getUpsellUuid,
  parseUpsellCookie,
  constants: {
    UPSELL_COOKIE_KEY,
    UPSELL_COOKIE_KEY_REGEX,
    UPSELL_QUERY_PARAM_KEY,
    UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX,
    UPSELL_TARGET_ITEM_URL_REGEX
  }
};
