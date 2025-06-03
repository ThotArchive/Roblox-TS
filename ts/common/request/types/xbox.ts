/**
 * Xbox
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

export enum XboxError {
  UNKNOWN = 0
}

export type getXboxConnectionReturnType = {
  hasConnectedXboxAccount: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_XBOX_CONNECTION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/xbox/connection`,
  timeout: 10000
};

export type disconnectXboxReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DISCONNECT_XBOX_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/xbox/disconnect`,
  timeout: 10000
};
