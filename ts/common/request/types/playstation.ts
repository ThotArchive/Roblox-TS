/**
 * PlayStation
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;
const playStationUrl = 'palisades-live';

export enum PlaystationError {
  UNKNOWN = 0
}

/**
 * Request Type: `GET`.
 */
export const GET_PLAYSTATION_CONNECTION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/${playStationUrl}/is-live`,
  timeout: 10000
};

export type disconnectPlaystationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DISCONNECT_PLAYSTATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/${playStationUrl}/disconnect`,
  timeout: 10000
};
