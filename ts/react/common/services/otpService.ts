import { EnvironmentUrls } from 'Roblox';
import { httpService, urlService } from 'core-utilities';
import { TOtpMetadataResponse } from '../types/otpTypes';

const getApiGatewayUrl = (endpoint: string): string => EnvironmentUrls.apiGatewayUrl + endpoint;

export const getOtpMetadata = async (origin: string): Promise<TOtpMetadataResponse> => {
  const url = getApiGatewayUrl('/otp-service/v1/metadata');
  const urlParams = { Origin: origin };
  const urlWithQueryParameters = `${url}?${urlService.composeQueryString(urlParams)}`;
  const urlConfig = {
    url: urlWithQueryParameters,
    withCredentials: true
  };
  const { data } = await httpService.get<TOtpMetadataResponse>(urlConfig);
  return data;
};

export default {
  getOtpMetadata
};
