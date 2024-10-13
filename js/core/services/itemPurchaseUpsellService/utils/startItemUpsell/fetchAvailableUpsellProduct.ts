import { AxiosResponse, httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import {
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  UpsellProduct
} from '../../constants/serviceTypeDefinitions';
import { GET_UPSELL_PRODUCT_API_URL } from '../../constants/upsellConstants';

export default async function fetchAvailableUpsellProduct(
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject,
  itemDetail: ItemDetailObject
): Promise<AxiosResponse<UpsellProduct>> {
  const userBalanceRobux = parseInt(itemPurchaseAjaxData.userBalanceRobux, 10);
  const requestBody = {
    upsell_platform: 'WEB',
    user_robux_balance: userBalanceRobux,
    attempt_robux_amount: itemDetail.expectedItemPrice
  };
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${GET_UPSELL_PRODUCT_API_URL}`,
    withCredentials: true
  };

  try {
    return await httpService.post<UpsellProduct>(urlConfig, requestBody);
  } catch (e) {
    return Promise.reject(e);
  }
}
