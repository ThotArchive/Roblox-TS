import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import {
  TSwitchParams,
  TSwitchResponse,
  TGetLoggedInUsersMetadataRequestParams,
  TGetLoggedInUsersMetadataResponse,
  TLogoutAllLoggedInUsersRequestParams
} from '../../common/types/accountSwitcherTypes';

// helper functions to build url
const getApiGatewayUrl = (endpoint: string): string => EnvironmentUrls.apiGatewayUrl + endpoint;

export const getLoggedInUsersMetadata = async (
  params: TGetLoggedInUsersMetadataRequestParams
): Promise<TGetLoggedInUsersMetadataResponse> => {
  const url = getApiGatewayUrl('/account-switcher/v1/getLoggedInUsersMetadata');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TGetLoggedInUsersMetadataResponse>(urlConfig, params);
  return data;
};

export const switchAccount = async (params: TSwitchParams): Promise<TSwitchResponse> => {
  const url = getApiGatewayUrl('/account-switcher/v1/switch');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.post<TSwitchResponse>(urlConfig, params);
  return data;
};

export const logoutAllLoggedInUsers = async (
  params: TLogoutAllLoggedInUsersRequestParams
): Promise<void> => {
  const url = getApiGatewayUrl('/account-switcher/v1/logoutAllLoggedInUsers');
  const urlConfig = {
    url,
    withCredentials: true
  };
  await httpService.post(urlConfig, params);
};
