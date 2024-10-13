import { EnvironmentUrls } from 'Roblox';
import { AxiosResponse, httpService } from 'core-utilities';
import { CREDIT_PAYMENT_PROVIDER_TYPE } from '../constants/constants';
import { TNextPurchasableMetadata, TProcessPayment } from '../constants/typeDefinitions';

type TGetConversionMetadata = {
  creditBalance: number;
  currencyCode: string;
  robuxConversionAmount: number;
};

const getConversionMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`
});

const getNextPurchasableMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/get-next-purchasable-metadata`
});

const processPaymentUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/process-payment`
});

export const getNextPurchasableMetadata = async (): Promise<
  AxiosResponse<TNextPurchasableMetadata>
> => {
  const urlConfig = getNextPurchasableMetadataUrlConfig();
  return httpService.get<TNextPurchasableMetadata>(urlConfig);
};

export const processPayment = async (
  productId: number | null | undefined
): Promise<AxiosResponse<TProcessPayment>> => {
  const productIdEmpty = productId === 0 || productId === undefined || productId === null;
  const providerPayload = {
    product_id: productIdEmpty ? undefined : productId
  };
  const params = {
    paymentProviderType: CREDIT_PAYMENT_PROVIDER_TYPE,
    providerPayload
  };

  const urlConfig = processPaymentUrlConfig();
  return httpService.post<TProcessPayment>(urlConfig, params);
};

export const getConversionMetadata = async (): Promise<AxiosResponse<TGetConversionMetadata>> => {
  const urlConfig = getConversionMetadataUrlConfig();
  return httpService.get<TGetConversionMetadata>(urlConfig);
};
