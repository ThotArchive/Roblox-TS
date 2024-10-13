/**
 * Account Pin
 */

import { EnvironmentUrls } from 'Roblox';
import UrlConfig from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/http/interfaces/UrlConfig';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

export enum AccountPinError {
  NO_ACCOUNT_PIN = 1,
  ACCOUNT_LOCKED = 2,
  FLOODED = 3,
  INCORRECT_PIN = 4
}

export type GetStateReturnType = {
  isEnabled: false;
  /** Seconds the account pin is unlocked for. */
  unlockedUntil: number | null;
};

/**
 * Request Type: `GET`.
 */
export const GET_STATE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/account/pin`,
  timeout: 10000
};

export type UnlockReturnType = {
  /** Seconds the account pin is unlocked for. */
  unlockedUntil: number;
};

/**
 * Request Type: `POST`.
 */
export const UNLOCK_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/account/pin/unlock`,
  timeout: 10000
};

export type LockReturnType = {
  success: true;
};

/**
 * Request Type: `POST`.
 */
export const LOCK_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/account/pin/lock`,
  timeout: 10000
};
