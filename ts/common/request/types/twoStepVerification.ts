/**
 * Two-Step Verification
 */

import { EnvironmentUrls } from 'Roblox';
import UrlConfig from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/http/interfaces/UrlConfig';

const URL_NOT_FOUND = 'URL_NOT_FOUND';

const twoStepVerificationApiUrl = EnvironmentUrls.twoStepVerificationApi ?? URL_NOT_FOUND;
const economyApiUrl = EnvironmentUrls.economyApi ?? URL_NOT_FOUND;
const tradesApiUrl = EnvironmentUrls.tradesApi ?? URL_NOT_FOUND;

const TwoStepVerificationTimeout = 10000;

export enum TwoStepVerificationError {
  UNKNOWN = 0,
  INVALID_CHALLENGE_ID = 1,
  INVALID_USER_ID = 2,
  INVALID_EMAIL = 3,
  INVALID_PASSWORD = 4,
  TOO_MANY_REQUESTS = 5,
  PIN_LOCKED = 6,
  FEATURE_DISABLED = 7,
  NOT_ALLOWED = 8,
  INVALID_CONFIGURATION = 9,
  INVALID_CODE = 10,
  CONFIGURATION_ALREADY_ENABLED = 11,
  INVALID_SETUP_TOKEN = 12,
  REAUTHENTICATION_REQUIRED = 13,
  INVALID_PHONE_NUMBER = 15,
  EXCEEDED_REGISTERED_KEYS_LIMIT = 16,
  INVALID_CREDENTIAL_NICKNAME = 17,
  AUTHENTICATOR_CODE_ALREADY_USED = 18,
  CHALLENGE_DENIED = 19,
  CROSS_DEVICE_DIALOG_EXPIRED = 20
}

/**
 * Used as a partial request type.
 */
export type Code = {
  code: string;
};

export type Fido2Credential = {
  nickname: string;
};

export type GetMetadataReturnType = {
  authenticatorHelpSiteAddress: string;
  twoStepVerificationEnabled: boolean;
  authenticatorEnabled: boolean;
  authenticatorQrCodeSize: string;
  emailCodeLength: number;
  authenticatorCodeLength: number;
  isAuthenticatorWithVerifiedPhoneEnabled: boolean;
  isSecurityKeyOnAllPlatformsEnabled: boolean;
  isSingleMethodEnforcementEnabled: boolean;
  isRecoveryCodeGenerationForAuthenticatorSetupEnabled: boolean;
  receiveWarningsOnDisableTwoStep: boolean;
  isSmsTwoStepVerificationAvailable: boolean;
  isSecurityKeyTwoStepVerificationAvailable: boolean;
  isAndroidSecurityKeyEnabled: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_METADATA_CONFIG: UrlConfig = {
  url: `${twoStepVerificationApiUrl}/v1/metadata`,
  withCredentials: true,
  timeout: TwoStepVerificationTimeout
};

export type GetUserConfigurationReturnType = {
  primaryMediaType: string;
  methods: {
    mediaType: string;
    enabled: boolean;
    updated: string;
  }[];
};

/**
 * Request Type: `GET`.
 */
export const GET_USER_CONFIGURATION_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration`,
  timeout: TwoStepVerificationTimeout
});

export type EnableEmailTwoStepVerificationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const ENABLE_EMAIL_TWO_STEP_VERIFICATION_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/email/enable`,
  timeout: TwoStepVerificationTimeout
});

export type SendEmailCodeReturnType = void;

/**
 * Request Type: `POST`.
 */
export const SEND_EMAIL_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/email/send-code`,
  timeout: TwoStepVerificationTimeout
});

export type VerifyEmailCodeReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_EMAIL_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/email/verify`,
  timeout: TwoStepVerificationTimeout
});

export type DisableEmailTwoStepVerificationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DISABLE_EMAIL_TWO_STEP_VERIFICATION_CONFIG: (
  userId: string
) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/email/disable`,
  timeout: TwoStepVerificationTimeout
});

export type EnableAuthenticatorReturnType = {
  setupToken: string;
  qrCodeImageUrl: string;
  manualEntryKey: string;
};

/**
 * Request Type: `POST`.
 */
export const ENABLE_AUTHENTICATOR_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/authenticator/enable`,
  timeout: TwoStepVerificationTimeout
});

export type EnableVerifyAuthenticatorReturnType = {
  recoveryCodes: string[];
};

/**
 * Request Type: `POST`.
 */
export const ENABLE_VERIFY_AUTHENTICATOR_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/authenticator/enable-verify`,
  timeout: TwoStepVerificationTimeout
});

export type VerifyAuthenticatorCodeReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_AUTHENTICATOR_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/authenticator/verify`,
  timeout: TwoStepVerificationTimeout
});

export type DisableAuthenticatorReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DISABLE_AUTHENTICATOR_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/authenticator/disable`,
  timeout: TwoStepVerificationTimeout
});

export type VerifyRecoveryCodeReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_RECOVERY_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/recovery-codes/verify`,
  timeout: TwoStepVerificationTimeout
});

export type GetRecoveryCodesStatusReturnType = {
  activeCount: number;
  created: string | null;
};

/**
 * Request Type: `GET`.
 */
export const GET_RECOVERY_CODES_STATUS_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/recovery-codes`,
  timeout: TwoStepVerificationTimeout
});

export type GenerateRecoveryCodesReturnType = {
  recoveryCodes: string[];
};

/**
 * Request Type: `GET`.
 */
export const GENERATE_RECOVERY_CODES_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/recovery-codes/regenerate`,
  timeout: TwoStepVerificationTimeout
});

export type EnableSmsTwoStepVerificationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const ENABLE_SMS_TWO_STEP_VERIFICATION_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/sms/enable`,
  timeout: TwoStepVerificationTimeout
});

export type SendSmsCodeReturnType = void;

/**
 * Request Type: `POST`.
 */
export const SEND_SMS_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/sms/send-code`,
  timeout: TwoStepVerificationTimeout
});

export type VerifySmsCodeReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_SMS_CODE_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/sms/verify`,
  timeout: TwoStepVerificationTimeout
});

export type GetSecurityKeyOptionsReturnType = {
  authenticationOptions: string;
  sessionId: string;
};

export type DisableSmsTwoStepVerificationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DISABLE_SMS_TWO_STEP_VERIFICATION_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/sms/disable`,
  timeout: TwoStepVerificationTimeout
});

export type EnableSecurityKeyReturnType = {
  creationOptions: CredentialCreationOptions;
  sessionId: string;
};

/**
 * Request Type: `POST`.
 */
export const ENABLE_SECURITY_KEY_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/security-key/enable`,
  timeout: TwoStepVerificationTimeout
});

export type EnableVerifySecurityKeyReturnType = void;

/**
 * Request Type: `POST`.
 */
export const ENABLE_VERIFY_SECURITY_KEY_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/security-key/enable-verify`,
  timeout: TwoStepVerificationTimeout
});

/**
 * Request Type: `GET`.
 */
export const GET_SECURITY_KEY_OPTIONS_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/security-key/verify-start`,
  timeout: TwoStepVerificationTimeout
});

export type VerifySecurityKeyCredentialReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const VERIFY_SECURITY_KEY_CREDENTIAL_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/security-key/verify-finish`,
  timeout: TwoStepVerificationTimeout
});

export type DeleteSecurityKeyReturnType = void;

/**
 * Request Type: `POST`.
 */
export const DELETE_SECURITY_KEY_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/security-key/disable`,
  timeout: TwoStepVerificationTimeout
});

export type ListSecurityKeyReturnType = {
  credentials: Fido2Credential[];
};

/**
 * Request Type: `POST`.
 */
export const LIST_SECURITY_KEY_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/configuration/security-key/list`,
  timeout: TwoStepVerificationTimeout
});

/**
 * Request Type: `GET`.
 */
export const GET_SPEND_FRICTION_STATUS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/spend-friction/two-step-verification/status`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `GET`.
 */
export const GET_TRADE_FRICTION_STATUS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${tradesApiUrl}/v1/trade-friction/two-step-verification/status`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `GET`.
 */
export const GET_RESALE_FRICTION_STATUS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/resale-friction/two-step-verification/status`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const GENERATE_SPEND_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/spend-friction/two-step-verification/generate`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const GENERATE_TRADE_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${tradesApiUrl}/v1/trade-friction/two-step-verification/generate`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const GENERATE_RESALE_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/resale-friction/two-step-verification/generate`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const REDEEM_SPEND_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/spend-friction/two-step-verification/redeem`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const REDEEM_TRADE_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${tradesApiUrl}/v1/trade-friction/two-step-verification/redeem`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const REDEEM_RESALE_FRICTION_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${economyApiUrl}/v2/resale-friction/two-step-verification/redeem`,
  timeout: TwoStepVerificationTimeout
};

/**
 * Request Type: `POST`.
 */
export const RETRY_CROSS_DEVICE_PROMPT_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/cross-device/retry`,
  timeout: TwoStepVerificationTimeout
});

export type RetryCrossDeviceReturnType = {};

/**
 * Request Type: `POST`.
 */
export const VERIFY_CROSS_DEVICE_PROMPT_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/cross-device/verify`,
  timeout: TwoStepVerificationTimeout
});

export type VerifyCrossDeviceReturnType = {
  verificationToken: string;
};

/**
 * Request Type: `POST`.
 */
export const RETRACT_CROSS_DEVICE_PROMPT_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${twoStepVerificationApiUrl}/v1/users/${userId}/challenges/cross-device/retract`,
  timeout: TwoStepVerificationTimeout
});

export type RetractCrossDeviceReturnType = {};
