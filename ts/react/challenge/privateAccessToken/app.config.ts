import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'PrivateAccessToken' as const;
export const LOG_PREFIX = 'Private-Access-Token:' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.PrivateAccessTokenChallenge'
};

/**
 * Language resource keys for private access token that are requested
 * dynamically.
 */
export const PRIVATE_ACCESS_TOKEN_LANGUAGE_RESOURCES = [
  'Description.VerificationError',
  'Description.VerificationSuccess',
  'Description.VerifyingYouAreNotBot'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengePrivateAccessTokenEvent',
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
