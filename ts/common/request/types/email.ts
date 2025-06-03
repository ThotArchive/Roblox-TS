/**
 * Email
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const accountSettingsApiUrl = EnvironmentUrls.accountSettingsApi ?? URL_NOT_FOUND;

export enum EmailError {
  FEATURE_DISABLED = 2,
  TOO_MANY_ACCOUNTS_ON_EMAIL = 3,
  TOO_MANY_ATTEMPTS_TO_UPDATE_EMAIL = 6,
  INVALID_EMAIL_ADDRESS = 9
}

export type UpdateForCurrentUserReturnType = void;

/**
 * Request Type: `POST`.
 */
export const UPDATE_FOR_CURRENT_USER_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSettingsApiUrl}/v1/email`,
  timeout: 10000
};

export type GetEmailConfigurationReturnType = {
  emailAddress: string;
  verified: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_EMAIL_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSettingsApiUrl}/v1/email`,
  timeout: 10000
};
