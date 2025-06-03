/**
 * Passwords
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

export enum PasswordsError {
  FLOODED = 2,
  INVALID_PASSWORD = 7,
  INVALID_CURRENT_PASSWORD = 8
}

export type ChangeForCurrentUserReturnType = void;

/**
 * Request Type: `POST`.
 */
export const CHANGE_FOR_CURRENT_USER_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v2/user/passwords/change`,
  timeout: 10000
};

/*
 * Password Reset
 */

export enum ResetError {
  USER_DOES_NOT_HAVE_EMAIL = 22
}

export type ResetSendPromptedReturnType = void;

/**
 * Request Type: `POST`.
 */
export const RESET_SEND_PROMPTED_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v2/passwords/reset/send-prompted`,
  timeout: 10000
};

/*
 * Password Validation
 */

export enum ValidationStatus {
  VALID_PASSWORD = 0,
  WEAK_PASSWORD = 1,
  SHORT_PASSWORD = 2,
  PASSWORD_SAME_AS_USERNAME = 3,
  FORBIDDEN_PASSWORD = 4,
  DUMB_STRINGS = 5
}

export type ValidateReturnType = {
  code: ValidationStatus;
  message: string;
};

/**
 * Request Type: `POST`.
 */
export const VALIDATE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v2/passwords/validate`,
  timeout: 10000
};
