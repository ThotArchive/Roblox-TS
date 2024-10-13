import { httpService } from 'core-utilities';
import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { PurchaseWarning } from '../constants/serviceTypeDefinitions';
import {
  GET_PURCHASE_WARNING_API,
  PURCHASE_WARNING_ACTION_TYPES,
  PURCHASE_WARNING_REQUEST_TIMEOUT
} from '../constants/upsellConstants';

export default async function getPurchaseWarningAction(productId: number): Promise<string> {
  const is13To17ScaryModalEnabled = !CurrentUser.isPremiumUser;
  const requestParam = {
    productId,
    is13To17ScaryModalEnabled
  };
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${GET_PURCHASE_WARNING_API}`,
    withCredentials: true,
    timeout: PURCHASE_WARNING_REQUEST_TIMEOUT
  };

  try {
    const purchaseWarningResponse = await httpService.get<PurchaseWarning>(urlConfig, requestParam);

    if (purchaseWarningResponse.status !== 200 || !purchaseWarningResponse.data.action) {
      return Promise.resolve(PURCHASE_WARNING_ACTION_TYPES.NoAction);
    }

    return Promise.resolve(purchaseWarningResponse.data.action);
  } catch (e) {
    return Promise.reject(e);
  }
}
