const minimumAge = 18;
const useMetadataTestResult = false;
const DisplayView = {
  LANDING: 'LANDING',
  EMAIL: 'EMAIL',
  MODAL: 'MODAL',
  SUCCESS_OVERAGE: 'SUCCESS_OVERAGE',
  SUCCESS_UNDERAGE: 'SUCCESS_UNDERAGE',
  SUCCESS_GENERIC: 'SUCCESS',
  FAILURE: 'FAILURE',
  PENDING: 'PENDING',
  POLLING: 'POLLING',
  EMAIL_CONTINUE: 'EMAIL_CONTINUE',
  EXTERNAL_EMAIL: 'EXTERNAL_EMAIL',
  ERROR: 'ERROR',
  TEMP_BAN: 'TEMP_BAN',
  PRIVACY_NOTICE: 'PRIVACY_NOTICE',
  VENDOR_LINK: 'VENDOR_LINK',
  ENABLE_VOICE_CHAT: 'ENABLE_VOICE_CHAT',
  ENABLE_AVATAR_CHAT: 'ENABLE_AVATAR_CHAT'
};

const CloseVendorModalEvent = 'close-veratad-modal-event';

const ModalEntry = {
  AccountSettings: 'AccountSettings',
  LuaApp: 'LuaApp',
  WebApp: 'WebApp',
  VPC: 'parent-account-setup',
  parentalVerification: 'parental-verification'
};

// Note: these "enum" values are not properly aligned with those defined on the
// server, but really should be:
// https://github.rbx.com/Roblox/identity-verification/blob/master/libs/identity-verification-library/src/Enums/VendorVerificationStatus.cs
const VerificationStatusCode = {
  NotStarted: 0,
  UpdatingRoblox: 1,
  Failure: 2,
  ManualReview: 3,
  RetryNeeded: 4,
  LinkOpened: 5,
  Submitting: 6,
  Success: 7
};

const VerificationErrorCode = {
  NoError: 0,
  UnknownError: 1,
  InvalidDocument: 2,
  InvalidSelfie: 3,
  BelowMinimumAge: 4,
  LowQualityMedia: 5,
  DocumentUnsupported: 6,
  MaximumNumberAccountsLinked: 7
};

const VerificationChecklistStep = {
  Connecting: 0,
  Verifying: 1,
  Pending: 2,
  UpdatingRoblox: 3
};

const ModalEvent = {
  OpenVoiceOptInOverlay: 'OpenVoiceOptInOverlay',
  OpenCameraOptInOverlay: 'OpenCameraOptInOverlay',
  OpenIdentityVerificationModal: 'OpenIdentityVerificationModal'
};

export {
  DisplayView,
  minimumAge,
  useMetadataTestResult,
  CloseVendorModalEvent,
  ModalEntry,
  VerificationStatusCode,
  VerificationChecklistStep,
  VerificationErrorCode,
  ModalEvent
};
