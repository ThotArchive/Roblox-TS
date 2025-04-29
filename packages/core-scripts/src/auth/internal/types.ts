export type HbaMeta = {
  isSecureAuthenticationIntentEnabled: boolean;
  isBoundAuthTokenEnabled: boolean;
  boundAuthTokenWhitelist: string;
  boundAuthTokenExemptlist: string;
  hbaIndexedDBName: string;
  hbaIndexedDBObjStoreName: string;
  hbaIndexedDBKeyName: string;
  hbaIndexedDBVersion: number;
  batEventSampleRate: number;
};

export type SecureAuthIntent = {
  clientPublicKey: string;
  clientEpochTimestamp: number;
  serverNonce: string;
  saiSignature: string;
};

export enum BatGenerationErrorKind {
  RequestExempt = "RequestExempt",
  RequestExemptError = "RequestExemptError",
  GetKeyPairFailed = "GetKeyPairFailed",
  UpdateKeyPairFailed = "UpdateKeyPairFailed",
  NoKeyPairFound = "NoKeyPairFound",
  RequestBodyHashFailed = "RequestBodyHashFailed",
  SignatureFailed = "SignatureFailed",
  Unknown = "Unknown",
}

export type BatGenerationErrorInfo = {
  message: string;
  kind: BatGenerationErrorKind;
};

export type SaiGenerationErrorInfo = {
  message: string;
  // TODO: Add discrete error kinds here...
};
