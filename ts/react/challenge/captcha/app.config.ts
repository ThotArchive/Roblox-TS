import { TranslationConfig } from 'react-utilities';
import { ActionType } from './interface';

export const FEATURE_NAME = 'Captcha' as const;
export const LOG_PREFIX = 'Captcha:' as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Authentication.Captcha'
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: {
    captcha: 'captcha',
    captchaInitiated: 'captchaInitiated',
    captchaV2Experimentation: 'captchaV2Experimentation'
  },
  captchaInitiatedChallengeType: {
    visible: 'visible',
    hidden: 'hidden',
    error: 'error'
  }
} as const;

/**
 * Constants for metrics tracking.
 */

export const METRICS_CONSTANTS = {
  event: {
    triggered: 'Triggered',
    initialized: 'Initialized',
    suppressed: 'Suppressed',
    displayed: 'Displayed',
    success: 'Success',
    providerError: 'FailedToLoad',
    metadataError: 'FailedToLoadMetadata'
  },
  sequence: {
    solveTime: 'SolveTime'
  }
};

/**
 * Language resource keys for captcha that are requested dynamically.
 */
export const CAPTCHA_LANGUAGE_RESOURCES = [
  'Action.PleaseTryAgain',
  'Action.Reload',
  'Description.VerifyingYouAreNotBot',
  'Message.Error.Default'
] as const;

/**
 * The type of `FUNCAPTCHA_PUBLIC_KEY_MAP`.
 */
type funCaptchaPublicKeyMap = { [K in ActionType]: string };

/**
 * Useful captcha constants that are used for public key maps and provider version.
 */
export const FUNCAPTCHA_PUBLIC_KEY_MAP: funCaptchaPublicKeyMap = {
  Login: 'ACTION_TYPE_WEB_LOGIN',
  AppLogin: 'ACTION_TYPE_WEB_LOGIN',
  Signup: 'ACTION_TYPE_WEB_SIGNUP',
  AppSignup: 'ACTION_TYPE_WEB_SIGNUP',
  JoinGroup: 'ACTION_TYPE_GROUP_JOIN',
  GroupWallPost: 'ACTION_TYPE_GROUP_WALL_POST',
  ResetPassword: 'ACTION_TYPE_WEB_RESET_PASSWORD',
  ToyCodeRedeem: 'ACTION_TYPE_WEB_GAMECARD_REDEMPTION',
  SupportRequest: 'ACTION_TYPE_SUPPORT_REQUEST',
  FollowUser: 'ACTION_TYPE_FOLLOW_USER',
  Generic: 'ACTION_TYPE_GENERIC_CHALLENGE',
  GameCardRedeem: 'ACTION_TYPE_WEB_GAMECARD_REDEMPTION',
  AssetComment: 'ACTION_TYPE_ASSET_COMMENT',
  Marketplace: 'ACTION_TYPE_MARKETPLACE'
};

/**
 * Provider version for the captcha V2 module.
 */
export const FUNCAPTCHA_VERSION_V2: string = 'V2' as const;

/**
 * Probability for a user to see CaptchaV2 will be `1 / EXPERIMENT_BUCKETS`.
 */
export const EXPERIMENT_BUCKETS = 1;

/**
 * Decimal value of a hexadecimal base.
 */
export const HEXADECIMAL_BASE = 16;

/**
 * Number of digits used for bucketing for CaptchaV2 experimentation.
 */
export const DIGITS_USED_FOR_BUCKETING = 2;
