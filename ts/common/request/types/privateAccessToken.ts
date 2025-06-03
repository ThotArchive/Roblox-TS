import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const privateAccessTokenServiceUrl = `${apiGatewayUrl}/private-access-token`;

export enum PrivateAccessTokenError {
  UNKNOWN = 0
}

/**
 * Request Type: `POST`.
 */
export const GET_PAT_TOKEN_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${privateAccessTokenServiceUrl}/v1/getPATToken`,
  timeout: 10000
};

export type GetPatTokenReturnType = { redemptionToken: string };
