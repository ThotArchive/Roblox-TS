import { upsellUtil } from 'core-roblox-utilities';

export function removeUrlQueryParameterNoRedirection() {
  if (!window.history) {
    return;
  }
  const urlObj = new URL(window.location.href);
  urlObj.searchParams.delete(upsellUtil.constants.UPSELL_QUERY_PARAM_KEY);
  const newUrl = urlObj.href;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

export function invalidateCurrentAutoPurchaseFlow() {
  upsellUtil.expireUpsellCookie(); // make sure the refreshing won't trigger auto purchase
  removeUrlQueryParameterNoRedirection(); // remove the url query parameter without refreshing
}
