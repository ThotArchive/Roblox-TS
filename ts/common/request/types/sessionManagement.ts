/**
 * Session Management
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

const tokenMetadataServiceUrl = `${apiGatewayUrl}/token-metadata-service`;

export enum SessionManagementError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  ATTEMPT_TO_INVALIDATE_CURRENT_TOKEN = 3
}

export enum AuthError {
  UNKNOWN = 1
}

export enum TokenMetadataAgentType {
  UNKNOWN = 'Unknown',
  APP = 'App',
  BROWSER = 'Browser',
  STUDIO = 'Studio'
}

export type TokenMetadataLocation = {
  city: string | null;
  subdivision: string | null;
  country: string | null;
};

export type TokenMetadataAgent = {
  type: TokenMetadataAgentType;
  value: string | null;
  os: string | null;
};

export type TokenMetadataItem = {
  token: string;
  location: TokenMetadataLocation | null;
  agent: TokenMetadataAgent | null;
  lastAccessedIp: string | null;
  lastAccessedTimestampEpochMilliseconds: string | null;
  isCurrentSession: boolean;
  parentSessionToken: string | null;
};

export type GetSessionsReturnType = {
  sessions: TokenMetadataItem[];
  hasMore: boolean;
  nextCursor: string;
};

/**
 * Request Type: `GET`.
 */
export const GET_SESSIONS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${tokenMetadataServiceUrl}/v1/sessions`,
  timeout: 10000
};

export type LogoutSessionReturnType = void;

/**
 * Request Type: `POST`.
 */
export const LOGOUT_SESSION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${tokenMetadataServiceUrl}/v1/logout`,
  timeout: 10000
};

export type LogoutFromAllSessionsReturnType = void;

/**
 * Request Type: `POST`.
 */
export const LOGOUT_FROM_ALL_SESSIONS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/logoutfromallsessionsandreauthenticate`,
  timeout: 10000
};
