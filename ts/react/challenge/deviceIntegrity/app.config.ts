import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'DeviceIntegrity' as const;
export const LOG_PREFIX = 'Device Integrity:' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.DeviceIntegrityChallenge'
};

/**
 * Language resource keys for the device integrity challenge that are requested
 * dynamically.
 */
export const DEVICE_INTEGRITY_LANGUAGE_RESOURCES = [
  'Description.VerificationError',
  'Description.VerificationSuccess',
  'Description.VerifyingYouAreNotBot'
] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityChallengeDeviceIntegrityEvent',
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

/**
 * Constants for challenge execution errors.
 */
export const ERROR_CONSTANTS = {
  getNativeResponseException: 'NATIVE_EXCEPTION',
  invalidNativeResponse: 'INVALID_NATIVE_RESPONSE',
  notInApp: 'NOT_IN_APP'
};

// Timeout value for the play integrity standard request.
export const INTEGRITY_REQUEST_TIMEOUT_MS = 450;

// Timeout value for hybridResponseService getNativeResponse call.
export const NATIVE_RESPONSE_TIMEOUT_MILLISECONDS = 1200;
