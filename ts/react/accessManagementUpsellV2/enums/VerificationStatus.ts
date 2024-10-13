export enum VerificationStatusCode {
  Unknown,
  Success,
  Failure,
  RequiresManualReview,
  RequiresRetry,
  Started,
  Submitted,
  Stored,
  Expired
}

export enum VerificationErrorCode {
  NoError,
  UnknownError,
  InvalidDocument,
  InvalidSelfie,
  BelowMinimumAge,
  LowQualityMedia,
  DocumentUnsupported
}

export enum VerificationViewState {
  LANDING,
  EMAIL,
  MODAL,
  SUCCESS_GENERIC,
  FAILURE,
  PENDING,
  POLLING,
  EMAIL_CONTINUE,
  EXTERNAL_EMAIL,
  ERROR,
  TEMP_BAN,
  VENDOR_LINK
}
