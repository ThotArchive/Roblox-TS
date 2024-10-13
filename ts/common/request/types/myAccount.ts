/**
 * My Account
 */

import UrlConfig from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/http/interfaces/UrlConfig';

const mySettingsUrl = '/my/settings/json';

export enum GetMySettingsInfoError {
  UNKNOWN = 0
}

export type GetMySettingsInfoReturnType = {
  IsEmailOnFile: boolean;
  IsEmailVerified: boolean;
  UserEmail: string;
  IsDisconnectXboxEnabled: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_MY_SETTINGS_INFO_CONFIG: UrlConfig = {
  withCredentials: true,
  url: mySettingsUrl,
  timeout: 10000
};
