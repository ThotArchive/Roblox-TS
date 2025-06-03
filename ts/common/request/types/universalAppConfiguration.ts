/**
 * Universal App Configuration
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const settingsUiPolicyName = 'account-settings-ui';
const universalAppConfigurationUrl = EnvironmentUrls.universalAppConfigurationApi ?? URL_NOT_FOUND;

export enum GetSettingsUIPolicyError {
  INTERNAL_ERROR = 9
}

export type GetSettingsUIPolicyReturnType = {
  displayTwoStepVerification: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_SETTINGS_UI_POLICY_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${universalAppConfigurationUrl}/v1/behaviors/${settingsUiPolicyName}/content`,
  timeout: 10000
};
