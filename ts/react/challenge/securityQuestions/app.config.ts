import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'SecurityQuestions' as const;
export const LOG_PREFIX = 'Security Questions:' as const;

// Constants used in specific contexts:
// The path of the Security Notification page on WWW.
export const SECURITY_NOTIFICATION_PATH = '/login/securityNotification' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ['CommonUI.Messages'],
  feature: 'Feature.SecurityQuestions'
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'securityQuestionsEvent',
  context: {
    answerChoicesFailedToLoad: 'answerChoicesFailedToLoad'
  }
} as const;

/**
 * Constants for metrics.
 */
export const METRIC_CONSTANTS = {
  event: {
    initialized: 'Initialized',
    errored: 'Errored',
    solved: 'Solved',
    incorrect: 'Incorrect',
    failed: 'Failed'
  }
} as const;

/**
 * Language resource keys for security questions that are requested
 * dynamically.
 */
export const COMMON_UI_MESSAGES_LANGUAGE_RESOURCES = ['Action.OK'] as const;
export const SECURITY_QUESTIONS_LANGUAGE_RESOURCES = [
  'Action.Confirm',
  'Action.Continue',
  'Action.PickN',
  'Action.PleaseTryAgain',
  'Action.Reload',
  'Action.SelectAllThatApply',
  'Description.RegainAccess',
  'Description.RegainAccessGeneric',
  'Description.UnknownChoice',
  'Description.VerifyYourIdentity',
  'Description.WhichGames',
  'Description.YourPasswordHasBeenReset',
  'Header.PleaseConfirmYourIdentity',
  'Message.Error.AnswerIncorrect',
  'Message.Error.Default',
  'Message.Error.MustPickN',
  'Message.Error.SecurityQuestions.SessionInactive',
  'Message.Error.SecurityQuestions.UserWasForceReset'
] as const;
