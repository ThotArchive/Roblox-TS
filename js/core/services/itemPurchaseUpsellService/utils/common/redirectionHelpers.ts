import { EnvironmentUrls, Endpoints } from 'Roblox';
import { urlService, httpService } from 'core-utilities';
import { upsellUtil } from 'core-roblox-utilities';
import { GET_VNG_SHOP_URL_PATH } from '../../constants/upsellConstants';
import { GetVngShopUrlResponse } from '../../constants/serviceTypeDefinitions';

export function redirectToCustomizeAvatar() {
  const customizeAvatarUrl = Endpoints.getAbsoluteUrl('/my/avatar');
  if (customizeAvatarUrl !== undefined && customizeAvatarUrl !== '') {
    upsellUtil.expireUpsellCookie();
    window.location.href = customizeAvatarUrl;
  }
}

export function redirectToCatalogShop() {
  upsellUtil.expireUpsellCookie();
  window.location.href = Endpoints.getAbsoluteUrl('/catalog');
}

export function redirectToItemPath(itemPath: string) {
  upsellUtil.expireUpsellCookie();
  window.location.href = Endpoints.getAbsoluteUrl(itemPath);
}

export function redirectToRobuxStore(isTablet: boolean, isUniversalApp: boolean) {
  // (04/18/2024): Tablet UA seems to need this route specifically for prompting the native purchase prompts. This is a workaround
  // to enable Tablet UA Gamepass upsells.
  if (isTablet && isUniversalApp) {
    window.location.href = urlService.getUrlWithQueries('/Upgrades/Robux.aspx', { ctx: '' });
    return;
  }

  window.location.href = Endpoints.getAbsoluteUrl('/upgrades/robux?ctx=upsell');
}

async function getVngShopUrl(): Promise<string> {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${GET_VNG_SHOP_URL_PATH}`,
    withCredentials: true
  };

  const response = await httpService.get<GetVngShopUrlResponse>(urlConfig);

  return response.data.vngShopRedirectUrl;
}

export function redirectToVngShop(): void {
  getVngShopUrl()
    .then(signedVngUrl => window.open(signedVngUrl, '_blank'))
    .catch(() => window.open(EnvironmentUrls.vngGamesShopUrl, '_blank'));
}
