import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

const getApiGatewayUrl = (endpoint: string): string => EnvironmentUrls.apiGatewayUrl + endpoint;

export const getServerNonce = async (): Promise<string> => {
  const url = getApiGatewayUrl('/hba-service/v1/getServerNonce');
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.get<string>(urlConfig);
  return data;
};

export default {
  getServerNonce
};
