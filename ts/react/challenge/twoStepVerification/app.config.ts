import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'TwoStepVerification' as const;
export const LOG_PREFIX = 'Two-Step Verification:' as const;
export const TIMEOUT_BEFORE_CALLBACK_MILLISECONDS = 100;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Authentication.TwoStepVerification'
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeTwoStepVerificationEvent',
  context: {
    challengeInitialized: 'challengeInitialized',
    userConfigurationLoaded: 'userConfigurationLoaded',
    challengeInvalidated: 'challengeInvalidated',
    challengeAbandoned: 'challengeAbandoned',
    emailResendRequested: 'emailResendRequested',
    smsResendRequested: 'smsResendRequested',
    mediaTypeChanged: 'mediaTypeChanged',
    codeSubmitted: 'codeSubmitted',
    codeVerificationFailed: 'codeVerificationFailed',
    codeVerified: 'codeVerified',
    noEnabledMethodsReturned: 'noEnabledMethodsReturned',
    tryToSwitchMediaType: 'switchMediaType'
  }
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    initialized: 'Initialized',
    verified: 'Verified',
    invalidated: 'Invalidated',
    abandoned: 'Abandoned'
  },
  sequence: {
    solveTime: 'SolveTime'
  }
} as const;

/**
 * Language resource keys for 2SV that are requested dynamically.
 */
export const TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES = [
  'Action.ChangeMediaType',
  'Action.Okay',
  'Action.Reload',
  'Action.Resend',
  'Action.Retry',
  'Action.Verify',
  'Description.Denied',
  'Description.Expired',
  'Description.LoginDenied',
  'Description.LoginExpired',
  'Heading.LoginDenied',
  'Heading.LoginError',
  'Label.ApproveWithDevice',
  'Label.AuthenticatorMediaType',
  'Label.ChooseAlternateMediaType',
  'Label.CharacterCodeInputPlaceholderText',
  'Label.CodeInputPlaceholderText',
  'Label.EmailMediaType',
  'Label.SecurityKeyDirections',
  'Label.SecurityKeyMediaType',
  'Label.SmsMediaType',
  'Label.EnterAuthenticatorCode',
  'Label.EnterEmailCode',
  'Label.EnterPassword',
  'Label.EnterRecoveryCode',
  'Label.EnterTextCode',
  'Label.HelpCenter',
  'Label.HelpCenterLink',
  'Label.LearnMore',
  'Label.NewLogin',
  'Label.NeedHelpContactSupport',
  'Label.PasskeyDirections',
  'Label.PasskeyMediaType',
  'Label.Password',
  'Label.PasswordPlaceholder',
  'Label.RecoveryCodeMediaType',
  'Label.RobloxSupport',
  'Label.TrustThisDevice',
  'Label.TwoStepVerification',
  'Label.UseYourDevice',
  'Label.VerifyWithPasskey',
  'Label.VerifyWithSecurityKey',
  'Response.AuthenticatorCodeAlreadyUsed',
  'Response.CodeSent',
  'Response.DefaultError',
  'Response.FeatureNotAvailable',
  'Response.InvalidCode',
  'Response.InvalidPassword',
  'Response.SessionExpired',
  'Response.SystemErrorSwitchingToEmail',
  'Response.TooManyAttempts',
  'Response.VerificationError'
] as const;

/**
 * Language resource keys for 2SV that are requested dynamically.
 *
 * This array should contain newly-added keys that are likely to have partial
 * translations across languages. Eventually, these keys may be moved into the
 * previous map as translations complete.
 */
export const TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES_NEW = [
  'Description.SecurityWarningShort',
  'Description.SecurityWarningShortBackupCodes'
] as const;
