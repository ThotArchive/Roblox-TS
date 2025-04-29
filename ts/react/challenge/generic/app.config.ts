export const FEATURE_NAME = 'GenericChallenge' as const;
export const LOG_PREFIX = 'Generic Challenge:' as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'challengeClientAnalysisEventV1',
  context: {
    onCompleted: 'onCompleted'
  }
};

/**
 * Constants for metrics.
 */
export const METRIC_CONSTANTS = {
  event: {
    success: 'Success',
    parseFailure: 'ParseFailure',
    renderFailure: 'RenderFailure',
    continueFailure: 'ContinueFailure'
  },
  unknown: 'unknown'
} as const;
