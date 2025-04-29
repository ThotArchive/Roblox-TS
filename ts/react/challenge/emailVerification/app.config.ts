import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'EmailVerification' as const;
export const LOG_PREFIX = 'EmailVerification:' as const;

export const OTP_CONTAINER_ID = 'otp-challenge-container' as const;

/**
 * Language resource keys for the email verification challenge that are requested
 * dynamically.
 */
export const EMAIL_VERIFICATION_LANGUAGE_RESOURCES = [
  'Message.Error.Default',
  'Header.VerifyYourAccount',
  'Description.SuspiciousActivityEmailVerificationV1',
  'Header.EnterCode',
  'Description.EnterCode',
  'Header.ConfirmAbandon',
  'Description.ConfirmAbandon',
  'Label.ConfirmAbandon',
  'Label.RejectAbandon'
] as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.EmailVerificationChallenge'
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeEmailVerificationEvent',
  context: {
    challengeInitialized: 'challengeInitialized',
    challengeCompleted: 'challengeCompleted',
    challengeInvalidated: 'challengeInvalidated',
    challengeAbandoned: 'challengeAbandoned'
  }
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    challengeInitialized: 'ChallengeInitialized',
    challengeCompleted: 'ChallengeCompleted',
    challengeInvalidated: 'ChallengeInvalidated',
    challengeAbandoned: 'ChallengeAbandoned'
  },
  sequence: {
    challengeSolveTime: 'ChallengeSolveTime'
  }
} as const;
