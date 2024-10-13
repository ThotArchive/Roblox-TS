export type TSecureAuthIntent = {
  clientPublicKey: string;
  clientEpochTimestamp: number;
  serverNonce: string;
  saiSignature: string;
};

export enum BatGenerationErrorKind {
  RequestExempt = 'RequestExempt',
  RequestExemptError = 'RequestExemptError',
  GetKeyPairFailed = 'GetKeyPairFailed',
  UpdateKeyPairFailed = 'UpdateKeyPairFailed',
  NoKeyPairFound = 'NoKeyPairFound',
  RequestBodyHashFailed = 'RequestBodyHashFailed',
  SignatureFailed = 'SignatureFailed',
  Unknown = 'Unknown'
}

export type BatGenerationErrorInfo = {
  message: string;
  kind: BatGenerationErrorKind;
};

export type SaiGenerationErrorInfo = {
  message: string;
  // TODO: Add discrete error kinds here...
};
