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
  TPostOptUserInToVoiceChatResponse
} from '../types/playButtonTypes';

const { gamesDataStore } = dataStores;

const getProductDetails = async (placeId: string[]): Promise<TGetProductDetails> => {
  const { data = [] } = (await gamesDataStore.getPlaceDetails(placeId)) as AxiosResponse<
    TGetProductDetails[]
  >;
  return data[0];
};

const getProductInfo = async (universeIds: string[]): Promise<TGetProductInfo> => {
  const {
    data: { data = [] }
  } = (await gamesDataStore.getProductInfo(universeIds)) as AxiosResponse<{
    data: TGetProductInfo[];
  }>;
  return data[0];
};

const getPlayabilityStatus = async (universeIds: string[]): Promise<TGetPlayabilityStatus> => {
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

export default {
  getProductInfo,
  getProductDetails,
  getPlayabilityStatus,
  getShowAgeVerificationOverlay,
  getGuacPlayButtonUI,
  postOptUserInToVoiceChat
};
