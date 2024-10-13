import { TSecureAuthIntent } from '../hardwareBackedAuth/types/hbaTypes';

export enum CredentialType {
  Username = 'Username',
  Email = 'Email',
  PhoneNumber = 'PhoneNumber',
  AuthToken = 'AuthToken',
  EmailOtpSessionToken = 'EmailOtpSessionToken',
  Passkey = 'Passkey'
}

// same with twoStepVerificationConstants.js in accountSetting
enum MediaType {
  Email = 'Email',
  Authenticator = 'Authenticator',
  RecoveryCode = 'RecoveryCode'
}

export type TCredentialsVerificationResponse = {
  canSend: boolean;
};

export type TCredentialsVerificationParams = {
  credentialType: CredentialType;
  credentialValue: string;
  password: string;
};

export type TAuthTokenServiceMetadataResponse = {
  IsLoginCodeButtonDisplayed: boolean;
  IsCodeValidationDisplayed: boolean;
  ShouldEnableCrossDeviceLoginInitiatorExperiments: boolean;
  ShouldEnableCrossDeviceLoginConfirmerExperiments: boolean;
};

// TODO: remove this from login types and use otpTypes
export type TOtpMetadataResponse = {
  OtpCodeLength: number;
  IsOtpEnabled: boolean;
};

// login with 2sv token request params
export type TLoginWithVerificationTokenParams = {
  challengeId: string;
  verificationToken: string;
  rememberDevice: boolean;
  secureAuthenticationIntent?: TSecureAuthIntent;
  accountBlob?: string;
};

// login with 2sv token response
export type TLoginWithVerificationTokenResponse = {
  identityVerificationLoginTicket: string;
  accountBlob?: string;
};

// login request params
export type TLoginParams = {
  ctype: CredentialType;
  cvalue: string;
  password: string;
  userId?: number;
  securityQuestionSessionId?: string;
  securityQuestionRedemptionToken?: string;
  captchaId?: string;
  captchaToken?: string;
  captchaProvider?: string;
  secureAuthenticationIntent?: TSecureAuthIntent;
  accountBlob?: string;
};

type TUser = {
  id: number;
  name: string;
  displayName: string;
};

export type TTwoStepVerificationData = {
  mediaType: MediaType;
  ticket: string;
};

export type TLoginResponse = {
  user: TUser;
  twoStepVerificationData: TTwoStepVerificationData;
  identityVerificationLoginTicket: string;
  isBanned: boolean;
  accountBlob?: string;
};
