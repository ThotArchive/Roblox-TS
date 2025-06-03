/**
 * Phone
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const accountInformationApiUrl = EnvironmentUrls.accountInformationApi ?? URL_NOT_FOUND;

export enum PhoneError {
  UNKNOWN = 0
}

export type GetPhoneConfigurationReturnType = {
  phone: string;
  isVerified: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_PHONE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone`,
  timeout: 10000
};
