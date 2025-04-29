import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'ProofOfWork' as const;
export const LOG_PREFIX = 'Proof-of-Work:' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.ProofOfWorkChallenge'
};

/**
 * Language resource keys for proof of work that are requested
 * dynamically.
 */
export const PROOF_OF_WORK_LANGUAGE_RESOURCES = [
  'Description.VerificationError',
  'Description.VerificationSuccess',
  'Description.VerifyingYouAreNotBot'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeProofOfWorkEvent',
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
