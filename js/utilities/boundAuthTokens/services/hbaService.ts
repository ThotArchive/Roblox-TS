import { EnvironmentUrls } from 'Roblox';

import { httpService } from '../../../core/http/http';

const getApiGatewayUrl = (endpoint: string): string => EnvironmentUrls.apiGatewayUrl + endpoint;

export const getServerNonce = async (): Promise<string> => {
  const url = getApiGatewayUrl('/hba-service/v1/getServerNonce');
  const urlConfig = {
    url,
    withCredentials: true
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data } = await httpService.get(urlConfig);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
};

export default {
  getServerNonce
};
