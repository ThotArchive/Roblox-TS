import * as TwoStepVerification from '../../../../common/request/types/twoStepVerification';
import {
  TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES,
  TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES_NEW
} from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId:
    | typeof TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES[number]
    | typeof TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES_NEW[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      ChangeMediaType: translate('Action.ChangeMediaType'),
      Okay: translate('Action.Okay'),
      Reload: translate('Action.Reload'),
      Resend: translate('Action.Resend'),
      Retry: translate('Action.Retry'),
      Verify: translate('Action.Verify')
    },
    Description: {
      LoginDenied: translate('Description.LoginDenied'),
      LoginExpired: translate('Description.LoginExpired'),
      SecurityWarningShort: translate('Description.SecurityWarningShort', {
        // No bolding of `IMPORTANT:` for now.
        boldStart: '',
        boldEnd: ''
      }),
      SecurityWarningShortBackupCodes: translate('Description.SecurityWarningShortBackupCodes', {
        // No bolding of `IMPORTANT:` for now.
        boldStart: '',
        boldEnd: ''
      })
    },
    Heading: {
      LoginDenied: translate('Heading.LoginDenied'),
      LoginError: translate('Heading.LoginError')
    },
    Label: {
      ApproveWithDevice: translate('Label.ApproveWithDevice'),
      AuthenticatorMediaType: translate('Label.AuthenticatorMediaType'),
      CrossDeviceMediaType: translate('Label.UseYourDevice'),
      ChooseAlternateMediaType: translate('Label.ChooseAlternateMediaType'),
      CharacterCodeInputPlaceholderText: (codeLength: number) =>
        translate('Label.CharacterCodeInputPlaceholderText', { codeLength }),
      CodeInputPlaceholderText: (codeLength: number) =>
        translate('Label.CodeInputPlaceholderText', { codeLength }),
      EmailMediaType: translate('Label.EmailMediaType'),
      EnterAuthenticatorCode: translate('Label.EnterAuthenticatorCode'),
      EnterEmailCode: translate('Label.EnterEmailCode'),
      EnterPassword: translate('Label.EnterPassword'),
      EnterRecoveryCode: translate('Label.EnterRecoveryCode'),
      EnterTextCode: translate('Label.EnterTextCode'),
      LearnMore: translate('Label.LearnMore'),
      HelpCenter: translate('Label.HelpCenter'),
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      HelpCenterLink: (helpCenterLinkHtml: string) =>
        translate('Label.HelpCenterLink', { helpCenterLink: helpCenterLinkHtml }),
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      NeedHelpContactSupport: (supportLinkHtml: string) =>
        translate('Label.NeedHelpContactSupport', { supportLink: supportLinkHtml }),
      NewLogin: translate('Label.NewLogin'),
      PasskeyDirections: translate('Label.PasskeyDirections'),
      PasskeyMediaType: translate('Label.PasskeyMediaType'),
      PasswordMediaType: translate('Label.Password'),
      PasswordPlaceholder: translate('Label.PasswordPlaceholder'),
      RecoveryCodeMediaType: translate('Label.RecoveryCodeMediaType'),
      RobloxSupport: translate('Label.RobloxSupport'),
      SecurityKeyDirections: translate('Label.SecurityKeyDirections'),
      SecurityKeyMediaType: translate('Label.SecurityKeyMediaType'),
      SmsMediaType: translate('Label.SmsMediaType'),
      TrustThisDevice: translate('Label.TrustThisDevice'),
      TwoStepVerification: translate('Label.TwoStepVerification'),
      VerifyWithPasskey: translate('Label.VerifyWithPasskey'),
      VerifyWithSecurityKey: translate('Label.VerifyWithSecurityKey')
    },
    Response: {
      AuthenticatorCodeAlreadyUsed: translate('Response.AuthenticatorCodeAlreadyUsed'),
      CodeSent: translate('Response.CodeSent'),
      DefaultError: translate('Response.DefaultError'),
      FeatureNotAvailable: translate('Response.FeatureNotAvailable'),
      InvalidCode: translate('Response.InvalidCode'),
      InvalidPassword: translate('Response.InvalidPassword'),
      SessionExpired: translate('Response.SessionExpired'),
      SystemErrorSwitchingToEmail: translate('Response.SystemErrorSwitchingToEmail'),
      TooManyAttempts: translate('Response.TooManyAttempts'),
      VerificationError: translate('Response.VerificationError')
    }
  } as const);

export type TwoStepVerificationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: TwoStepVerificationResources,
  errorCode: ErrorCode
): string => {
  switch (errorCode) {
    case ErrorCode.SESSION_EXPIRED:
      return resources.Response.SessionExpired;
    default:
      return resources.Response.DefaultError;
  }
};

export const mapTwoStepVerificationErrorToResource = (
  resources: TwoStepVerificationResources,
  error: TwoStepVerification.TwoStepVerificationError | null
): string => {
  switch (error) {
    case TwoStepVerification.TwoStepVerificationError.FEATURE_DISABLED:
      return resources.Response.FeatureNotAvailable;
    case TwoStepVerification.TwoStepVerificationError.INVALID_CODE:
      return resources.Response.InvalidCode;
    case TwoStepVerification.TwoStepVerificationError.TOO_MANY_REQUESTS:
      return resources.Response.TooManyAttempts;
    case TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID:
      return resources.Response.SessionExpired;
    case TwoStepVerification.TwoStepVerificationError.AUTHENTICATOR_CODE_ALREADY_USED:
      return resources.Response.AuthenticatorCodeAlreadyUsed;
    case TwoStepVerification.TwoStepVerificationError.INVALID_PASSWORD:
      return resources.Response.InvalidPassword;
    default:
      return resources.Response.DefaultError;
  }
};

export const mapTwoStepVerificationErrorToChallengeErrorCode = (
  error: TwoStepVerification.TwoStepVerificationError | null
): ErrorCode => {
  switch (error) {
    case TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID:
      return ErrorCode.SESSION_EXPIRED;
    default:
      return ErrorCode.UNKNOWN;
  }
};
