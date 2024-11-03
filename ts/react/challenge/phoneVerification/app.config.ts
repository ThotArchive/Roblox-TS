import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'PhoneVerification' as const;
export const LOG_PREFIX = 'PhoneVerification:' as const;
export const UPSELL_ORIGIN = 'challenge' as const;

export const PHONE_ROOT_ELEMENT_ID = 'phoneverification-challenge-container' as const;

/**
 * Language resource keys for the phone verification challenge that are requested
 * dynamically.
 */
export const PHONE_VERIFICATION_LANGUAGE_RESOURCES = [
  'Message.Error.Default',
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
  feature: 'Feature.PhoneVerificationChallenge'
};

export const VERIFICATION_UPSELL_TRASLATION_KEY = {
  Description: {
    SuspiciousActivityPhoneVerification: 'Description.SuspiciousActivityPhoneVerificationV1',
    LegalText: 'Description.ChallengeLegalDisclaimerV1'
  },
  Header: {
    VerifyYourAccountHeader: 'Header.VerifyYourAccountHeader'
  }
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengePhoneVerificationEvent',
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
