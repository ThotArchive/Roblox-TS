import { AxiosResponse } from 'axios';
import { dataStores } from 'core-roblox-utilities';
import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import {
  TGetProductInfo,
  TGetPlayabilityStatus,
  TGetProductDetails,
  TShowAgeVerificationOverlayResponse,
  TGuacPlayButtonUIResponse,
  TPostOptUserInToVoiceChatResponse,
  TGetUserSettingsAndOptionsResponse,
  TAgeGuidelinesResponse,
  TFiatPreparePurchaseResponse,
  TFiatPreparePurchaseCheckoutUrl
} from '../types/playButtonTypes';

const { gamesDataStore } = dataStores;

const getProductDetails = async (placeId: string[]): Promise<TGetProductDetails | undefined> => {
  const { data = [] } = (await gamesDataStore.getPlaceDetails(placeId)) as AxiosResponse<
    TGetProductDetails[]
  >;
  return data[0];
};

const getProductInfo = async (universeIds: string[]): Promise<TGetProductInfo | undefined> => {
  const {
    data: { data = [] }
  } = (await gamesDataStore.getProductInfo(universeIds)) as AxiosResponse<{
    data: TGetProductInfo[];
  }>;
  return data[0];
};

const getPlayabilityStatus = async (
  universeIds: string[]
): Promise<TGetPlayabilityStatus | undefined> => {
  const { data = [] } = (await gamesDataStore.getPlayabilityStatus(universeIds)) as AxiosResponse<
    TGetPlayabilityStatus[]
  >;
  return data[0];
};

const getGuacPlayButtonUI = async (): Promise<TGuacPlayButtonUIResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/universal-app-configuration/v1/behaviors/play-button-ui/content`
  };
  const { data } = await httpService.get(urlConfig);
  return data as TGuacPlayButtonUIResponse;
};

const getShowAgeVerificationOverlay = async (
  universeId: string
): Promise<TShowAgeVerificationOverlayResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.voiceApi}/v1/settings/verify/show-age-verification-overlay/${universeId}`
  };
  const { data } = await httpService.get(urlConfig);
  return data as TShowAgeVerificationOverlayResponse;
};

const postOptUserInToVoiceChat = async (
  isUserOptIn: boolean
): Promise<TPostOptUserInToVoiceChatResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.voiceApi}/v1/settings/user-opt-in`
  };
  const params = {
    isUserOptIn
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  const { data } = await httpService.post(urlConfig, params);
  return data as TPostOptUserInToVoiceChatResponse;
};

const getUserSettingsAndOptions = (): Promise<TGetUserSettingsAndOptionsResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings/settings-and-options`,
    withCredentials: true
  };

  return httpService.get<TGetUserSettingsAndOptionsResponse>(urlConfig).then(response => {
    return response.data;
  });
};

const getAgeRecommendation = (universeId: string): Promise<TAgeGuidelinesResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/experience-guidelines-api/experience-guidelines/get-age-recommendation`,
    withCredentials: true
  };

  return httpService
    .post<TAgeGuidelinesResponse>(urlConfig, {
      universeId
    })
    .then(response => {
      return response.data;
    });
};

const getFiatPurchaseUrl = (rootPlaceId: string, expectedBasePriceId: string): Promise<string> => {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/fiat-paid-access-service/v1/purchase`,
    withCredentials: true,
    retryable: true
  };

  return httpService
    .post<TFiatPreparePurchaseResponse>(urlConfig, {
      rootPlaceId,
      expectedBasePriceId
    })
    .then(response => {
      const parsedCheckoutUrlData = JSON.parse(
        response.data?.checkoutUrl ?? ''
      ) as TFiatPreparePurchaseCheckoutUrl;
      return parsedCheckoutUrlData?.checkoutUrl ?? '';
    });
};

export default {
  getProductInfo,
  getProductDetails,
  getPlayabilityStatus,
  getShowAgeVerificationOverlay,
  getGuacPlayButtonUI,
  postOptUserInToVoiceChat,
  getUserSettingsAndOptions,
  getAgeRecommendation,
  getFiatPurchaseUrl
};
