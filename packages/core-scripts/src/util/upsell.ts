import "../global";
import environmentUrls from "@rbx/environment-urls";
// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { getQueryParam, formatUrl } from "./url";

const UPSELL_COOKIE_KEY = "RBXCatalogUpsellData";
const UPSELL_COOKIE_KEY_REGEX = /RBXCatalogUpsellData=([^;]+)/;
const UPSELL_QUERY_PARAM_KEY = "UpsellUuid";
const UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX = /((\/[\w-]+)+)\/(\d+)/g;
const UPSELL_TARGET_ITEM_URL_REGEX = /((\/[\w-]+)+)\/(\d+)/g;

export const expireUpsellCookie = (): void => {
  const expiredUpsellCookieStr = `${UPSELL_COOKIE_KEY}=;path=/;domain=.${environmentUrls.domain};expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  if (document.cookie.includes(UPSELL_COOKIE_KEY)) {
    document.cookie = expiredUpsellCookieStr;
  }
};

const atLeastLen11 = <T>(arr: T[]): arr is [T, T, T, T, T, T, T, T, T, T, T, ...T[]] =>
  arr.length >= 11;

export type UpsellCookieData = {
  upsellUuid: string;
  targetItemUrl: string;
  userId: string;
  returnUrl: string;
  expectedCurrency: string;
  expectedPrice: string;
  expectedSellerId: string;
  userAssetId: string;
  productId: string;
  collectibleItemId: string;
  collectibleItemInstanceId: string;
  collectibleProductId: string;
};

export const parseUpsellCookie = (): Partial<UpsellCookieData> => {
  const catalogUpsellData = UPSELL_COOKIE_KEY_REGEX.exec(document.cookie);
  const upsellUuidFromQuery = getQueryParam(UPSELL_QUERY_PARAM_KEY);
  if (catalogUpsellData?.[1] != null && upsellUuidFromQuery != null) {
    const upsellData = decodeURIComponent(catalogUpsellData[1]).split(",");
    if (!atLeastLen11(upsellData)) {
      expireUpsellCookie();
      return {};
    }

    const [
      upsellUuidFromCookie,
      targetItemUrl,
      userId,
      expectedCurrency,
      expectedPrice,
      expectedSellerId,
      userAssetId,
      productId,
      collectibleItemId,
      collectibleItemInstanceId,
      collectibleProductId,
    ] = upsellData;

    const itemUrlValid = UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX.exec(targetItemUrl);
    UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX.lastIndex = 0; // reset regex
    if (
      upsellUuidFromQuery === upsellUuidFromCookie &&
      window.Roblox.CurrentUser?.userId === userId &&
      itemUrlValid
    ) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const returnUrl = formatUrl({
        pathname: targetItemUrl,
        query: { [UPSELL_QUERY_PARAM_KEY]: upsellUuidFromCookie },
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
        collectibleProductId,
      };
    }
  }

  expireUpsellCookie();
  return {};
};

export const getUpsellUuid = (): string | string[] | null | undefined => {
  const upsellUuid = getQueryParam(UPSELL_QUERY_PARAM_KEY);
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
};

export const constants = {
  UPSELL_COOKIE_KEY,
  UPSELL_COOKIE_KEY_REGEX,
  UPSELL_QUERY_PARAM_KEY,
  UPSELL_TARGET_ITEM_URL_COOKIE_DATA_REGEX,
  UPSELL_TARGET_ITEM_URL_REGEX,
} as const;
