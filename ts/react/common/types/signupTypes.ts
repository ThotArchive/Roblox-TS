import React from 'react';
import { IOtpSession } from '../../emailVerifyCodeModal/interface';
import { TSecureAuthIntent } from '../hardwareBackedAuth/types/hbaTypes';

export enum GenderType {
  unknown = 1,
  male = 2,
  female = 3
}

export type TSignupParams = {
  username: string;
  password: string;
  gender?: GenderType;
  birthday: Date;
  isTosAgreementBoxChecked: boolean;
  email?: string;
  locale?: string;
  agreementIds?: string[];
  identityVerificationResultToken?: string;
  captchaId?: string;
  captchaToken?: string;
  captchaProvider?: string;
  secureAuthenticationIntent?: TSecureAuthIntent;
  otpSession?: IOtpSession;
  dataToken?: string;
  accountBlob?: string;
};

export type TSignupResponse = {
  userId: number;
  starterPlaceId?: number;
  returnUrl?: string;
  accountBlob?: string;
};

export type TAuthMetadataV2Response = {
  IsUpdateUsernameEnabled?: boolean;
  FtuxAvatarAssetMap?: string;
  IsEmailUpsellAtLogoutEnabled?: boolean;
  ShouldFetchEmailUpsellIXPValuesAtLogout?: boolean;
  IsAccountRecoveryPromptEnabled?: boolean;
  IsContactMethodRequiredAtSignup?: boolean;
  IsUserAgreementsSignupIntegrationEnabled?: boolean;
  ArePasswordFieldsPlaintext?: boolean;
  IsKoreaIdVerificationEnabled?: boolean;
  IsAltBrowserTracker?: boolean;
};

export type TUserAgreement = {
  id: string;
  agreementType: string;
  clientType: string;
  regulationType: string;
  displayUrl: string;
};

export type TUserAgreementsResponse = TUserAgreement[];

export type TValidateUsernameParams = {
  username: string;
  birthday?: Date;
  context: string;
};

export type TValidateUsernameResponse = {
  code: number;
  message: string;
};

export type TValidatePasswordParams = {
  username: string;
  password: string;
};

export type TValidatePasswordResponse = {
  code: number;
  message: string;
};

export type TPostUsernameSuggestionsParams = {
  Username: string;
  Birthday: Date;
};

export type TPostUsernameSuggestionsResponse = {
  didGenerateNewUsername: boolean;
  suggestedUsernames: string[];
};

export type TBirthdaySelectOption = {
  value: string;
  label: string;
};

export type TBirthdaySelect = {
  options: TBirthdaySelectOption[];
  className: string;
  idName: string;
  birthdayName: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  ref: React.RefObject<HTMLSelectElement>;
};

export enum FormFieldStatus {
  Incomplete,
  Valid,
  Invalid
}

export enum KoreaSignupCompliancePolicyCheckboxType {
  All,
  Required,
  Optional
}
