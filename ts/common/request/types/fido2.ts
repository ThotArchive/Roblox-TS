/**
 * Fido2
 */

export enum Fido2Error {
  UNKNOWN = 0,
  CANCELLATION_ERROR = 1,
  INTERRUPTED_ERROR = 2,
  INVALID_REQUEST = 3,
  JSON_EXCEPTION = 4,
  CREDENTIALS_PROTOCOL_NOT_SUPPORTED = 5,
  NO_CREDENTIALS_FOUND = 6,
  INVALID_STATE_ERROR = 11
}

export type GetNativeResponseReturnType = string | null;

export type GetNavigatorCredentialsReturnType = string | null;
