import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';
import { Fido2Credential } from './twoStepVerification';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

const AUTH_API_TIMEOUT = 10000;

export enum AuthApiError {
  UNKNOWN = 0,
  EXCEEDED_REGISTERED_KEYS_LIMIT = 1,
  FEATURE_DISABLED = 2,
  INVALID_CREDENTIAL_NICKNAME = 3
}

export type StartRegistrationReturnType = {
  creationOptions: CredentialCreationOptions;
  sessionId: string;
};

/**
 * Request Type: `POST`.
 */
export const START_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/StartRegistration`,
  timeout: AUTH_API_TIMEOUT
};

export type FinishRegistrationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const FINISH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/FinishRegistration`,
  timeout: AUTH_API_TIMEOUT
};

export type DeleteCredentialBatchReturnType = void;

export const DELETE_CREDENTIAL_BATCH_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/DeleteCredentialBatch`,
  timeout: AUTH_API_TIMEOUT
};

export type ListCredentialsReturnType = {
  credentials: Fido2Credential[];
};

export const LIST_CREDENTIALS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/ListCredentials`,
  timeout: AUTH_API_TIMEOUT
};
