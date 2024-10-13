import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'Reauthentication' as const;
export const LOG_PREFIX = 'Re-authentication:' as const;

// Constants used in specific contexts:
// The URL of the Forgot Password support page.
export const FORGOT_PASSWORD_SUPPORT_URL = 'https://en.help.roblox.com/hc/articles/203313070-I-Forgot-My-Password' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.Reauthentication'
};

/**
 * Language resource keys for re-authentication that are requested dynamically.
 */
export const REAUTHENTICATION_LANGUAGE_RESOURCES = [
  'Action.ChangeVerificationMethod',
  'Action.CodeSent',
  'Action.ForgotYourPassword',
  'Action.PleaseTryAgain',
  'Action.TryAlternativeMethod',
  'Action.Verify',
  'Action.ResendCode',
  'Description.EnterYourOtpCode',
  'Description.EnterYourPassword',
  'Header.OtpVerification',
  'Header.PasskeyVerification',
  'Header.PasswordVerification',
  'Header.VerificationMethodSelection',
  'Label.ChooseVerificationMethod',
  'Label.OneTimeCode',
  'Label.Passkey',
  'Label.PasskeyDirections',
  'Label.Password',
  'Label.VerifyWithPasskey',
  'Label.YourOtpCode',
  'Label.YourPassword',
  'Message.Error.Default',
  'Message.Error.NoCredentialsFound',
  'Message.Error.OtpCodeIncorrect',
  'Message.Error.OtpCodeExpired',
  'Message.Error.OtpCodeThrottled',
  'Message.Error.OtpRedeemFailure',
  'Message.Error.PasswordIncorrect'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeReauthenticationEvent',
  context: {
    challengeInitialized: 'challengeInitialized',
    userConfigurationLoaded: 'userConfigurationLoaded',
    challengeInvalidated: 'challengeInvalidated',
    challengeAbandoned: 'challengeAbandoned',
    challengeCompleted: 'challengeCompleted',
    otpResendRequested: 'otpResendRequested',
    reauthenticationTypeChanged: 'reauthenticationTypeChanged',
    codeSubmitted: 'codeSubmitted',
    codeVerificationFailed: 'codeVerificationFailed',
    codeVerified: 'codeVerified',
    noEnabledMethodsReturned: 'noEnabledMethodsReturned'
  }
} as const;

/**
 * Constants for prometheus metrics.
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
