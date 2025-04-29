import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'Rostile' as const;
export const LOG_PREFIX = 'Rostile' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.RostileChallenge'
};

/**
 * Language resource keys for rostile that are requested
 * dynamically.
 */
export const ROSTILE_LANGUAGE_RESOURCES = [
  'Description.VerificationError',
  'Description.VerificationSuccess',
  'Description.VerificationPrompt',
  'Description.VerificationHeader',
  'Description.VerificationErrorHeader',
  'Description.ImAHuman',
  'Description.Ok'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeRostileEvent',
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
