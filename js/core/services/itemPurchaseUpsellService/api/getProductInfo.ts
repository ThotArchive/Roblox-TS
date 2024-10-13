import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import {
  GET_PRODUCT_INFO_API,
  PRODUCT_INFO_API_SUCCESS_REASON
} from '../constants/upsellConstants';
import { ProductInfo } from '../constants/serviceTypeDefinitions';

export default async function getProductInfo(productId: string): Promise<ProductInfo> {
  const getProductInfoPath = GET_PRODUCT_INFO_API.replace('{productId}', productId);
  const urlConfig = {
    url: `${EnvironmentUrls.economyApi}${getProductInfoPath}`,
    withCredentials: true
  };

  try {
    const productInfoResponse = await httpService.get<ProductInfo>(urlConfig);

    if (
      productInfoResponse.status !== 200 ||
      productInfoResponse.data.reason !== PRODUCT_INFO_API_SUCCESS_REASON
    ) {
      return Promise.reject(productInfoResponse?.data?.reason);
    }

    return Promise.resolve(productInfoResponse.data);
  } catch (e) {
    return Promise.reject(e);
  }
}
