/**
 * Otp
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const otpServiceUrl = `${apiGatewayUrl}/otp-service`;

export enum OtpError {
  NO_ERROR = 0,
  UNKNOWN = 1,
  INVALID_CODE = 2,
  INVALID_SESSION_TOKEN = 3,
  CODE_EXPIRED = 4,
  UNVALIDATED_SESSION_TOKEN = 5,
  TOO_MANY_REQUESTS = 6,
  CONTACT_MALFORMED = 7,
  VPN_REQUIRED = 8,
  UNAUTHENTICATED = 9,
  METHOD_UNAVAILABLE = 10
}

/**
 * Request Type: `POST`.
 */
export const SEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${otpServiceUrl}/v1/sendCodeForUser`,
  timeout: 10000
};

export type SendCodeReturnType = {
  otpSessionToken: string;
};

/**
 * Request Type: `POST`.
 */
export const RESEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${otpServiceUrl}/v1/resendCode`,
  timeout: 10000
};

export type ResendCodeReturnType = {
  otpSessionToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VALIDATE_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${otpServiceUrl}/v1/validateCode`,
  timeout: 10000
};

export type ValidateCodeReturnType = {
  contactValue: string;
};

/**
 * Request Type: `GET`.
 */
export const GET_METADATA_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${otpServiceUrl}/v1/metadata`,
  timeout: 10000
};

export type MetadataReturnType = {
  OtpCodeLength: number;
  IsOtpEnabled: boolean;
};

export enum ContactTypes {
  Unset = 'Unset',
  Email = 'Email'
}

export enum Origin {
  Reauth = 'Reauth',
  Challenge = 'Challenge'
}

export enum MessageVariant {
  Default = 'Default'
}
