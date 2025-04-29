import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'ProofOfSpace' as const;
export const LOG_PREFIX = 'Proof-of-Space:' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.ProofOfSpaceChallenge'
};

/**
 * Language resource keys for proof of space that are requested
 * dynamically.
 */
export const PROOF_OF_SPACE_LANGUAGE_RESOURCES = [
  'Description.VerificationError',
  'Description.VerificationSuccess',
  'Description.VerifyingYouAreNotBot'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeProofOfSpaceEvent',
  context: {
    challengeInitialized: 'challengeInitialized',
    puzzleInitialized: 'puzzleInitialized',
    puzzleCompleted: 'puzzleCompleted',
    challengeCompleted: 'challengeCompleted',
    challengeInvalidated: 'challengeInvalidated',
    challengeAbandoned: 'challengeAbandoned',
    challengeTimeout: 'challengeTimeout'
  }
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    challengeInitialized: 'ChallengeInitialized',
    puzzleInitialized: 'PuzzleInitialized',
    puzzleCompleted: 'PuzzleCompleted',
    challengeCompleted: 'ChallengeCompleted',
    challengeInvalidated: 'ChallengeInvalidated',
    challengeAbandoned: 'ChallengeAbandoned',
    challengeTimeout: 'ChallengeTimeout'
  },
  sequence: {
    puzzleWorkingTime: 'PuzzleWorkingTime',
    challengeSolveTime: 'ChallengeSolveTime'
  }
} as const;
