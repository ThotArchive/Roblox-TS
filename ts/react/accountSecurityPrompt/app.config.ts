import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'AccountSecurityPrompt' as const;
export const LOG_PREFIX = 'Account Security Prompt:' as const;
export const ROOT_ELEMENT_ID = 'account-security-prompt-container' as const;

// This will be sent when we redirect to the account settings so that we
// know that it's a redirect and not an organic entry to the account settings.
// In this case we won't show the prompt again but instead enable authenticator.
export const AUTH_REDIRECT_URL_SIGNIFIER = 'authpopup' as const;

// The same as above but for email 2SV highlighting.
export const EMAIL_HIGHLIGHT_REDIRECT_URL_SIGNIFIER = 'emailhighlight' as const;

// This is the Authenticator Upsell path in Account Settings.
export const ACCOUNT_SETTINGS_SECURITY_PATH = '/my/account#!/security?src=';

// We won't open the Authenticator Upsell if we're already in Account Settings
// (as determined by matching on this URL fragment).
export const ACCOUNT_SETTINGS_URL_FRAGMENT = '.com/my/account' as const;

// We won't open Broader Authenticator Upsell if we're not on the home page.
// Behavior controlled by prompt metadata.
export const HOME_PAGE_URL_FRAGMENT = '.com/home' as const;

// Constants used in specific contexts:
export const CHANGE_PASSWORD_SUGGESTED_CHARACTER_COUNT = 8 as const;
export const DAYS_REMAINING_TO_FORCE_RESET_DEFAULT = 14 as const;
// The URL of the Forgot Password support page.
export const FORGOT_PASSWORD_SUPPORT_URL = 'https://en.help.roblox.com/hc/articles/203313070-I-Forgot-My-Password' as const;
// The URL of the 2SV support page.
export const TWO_STEP_SUPPORT_URL =
  'https://en.help.roblox.com/hc/articles/212459863-Add-2-Step-Verification-to-Your-Account';
// The URL of Change Password Banner support page.
export const CHANGE_PASSWORD_BANNER_SUPPORT_URL =
  'https://en.help.roblox.com/hc/articles/4416940180500-Why-am-I-seeing-a-banner-asking-me-to-change-my-password-';

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: 'accountSecurityPromptEvent',
  context: {
    modalStateViewed: 'modalStateViewed'
  }
} as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.AccountSecurityPrompt'
};
