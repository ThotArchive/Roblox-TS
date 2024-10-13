import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { PurchaseWarning } from '../constants/serviceTypeDefinitions';
import {
  ACK_PURCHASE_WARNING_API,
  PURCHASE_WARNING_REQUEST_TIMEOUT
} from '../constants/upsellConstants';

export default async function acknowledgePurchaseWarning(
  action: string,
  onAcknowledgedCallback: () => void
): Promise<void> {
  const requestBody = {
    acknowledgement: `Confirmed${action}`
  };
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}${ACK_PURCHASE_WARNING_API}`,
    withCredentials: true,
    timeout: PURCHASE_WARNING_REQUEST_TIMEOUT
  };

  try {
    await httpService.post<PurchaseWarning>(urlConfig, requestBody);

    onAcknowledgedCallback();
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}
