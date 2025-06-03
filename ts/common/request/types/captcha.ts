/**
 * Captcha
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayCdnUrl ?? URL_NOT_FOUND;

const captchaServiceUrl = `${apiGatewayUrl}/captcha`;

// Placeholder type:
export enum CaptchaError {
  UNKNOWN = 0
}

export type GetMetadataReturnType = {
  funCaptchaPublicKeys: Record<string, string>;
  disableCaptchaVersionExperiment?: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_METADATA_CONFIG: UrlConfig = {
  url: `${captchaServiceUrl}/v1/metadata`,
  timeout: 60000
};
