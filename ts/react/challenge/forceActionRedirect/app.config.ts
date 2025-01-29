import { TranslationConfig } from 'react-utilities';
import { ForceActionRedirectTranslateFunction } from './constants/resources';
import { ForceActionRedirectChallengeConfig, ForceActionRedirectChallengeType } from './interface';

export const FEATURE_NAME = 'ForceActionRedirect' as const;
export const LOG_PREFIX = 'ForceActionRedirect:' as const;

// This is the 2-Step Verification path in Account Settings.
export const ACCOUNT_SETTINGS_SECURITY_PATH = '/my/account#!/security?src=';

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
const FORCE_AUTHENTICATOR_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.ForceAuthenticator'
};

const FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.ForceTwoStepVerification'
};

const BLOCK_SESSION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.Denied'
};

/**
 * Language resource keys for force authenticator that are requested dynamically.
 */
export const FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES = [
  'Action.Setup',
  'Description.Reason',
  'Description.SetupAuthenticator',
  'Header.TurnOnAuthenticator'
] as const;

export const FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES = [
  'ForceTwoStepVerification.Header',
  'ForceTwoStepVerification.Body',
  'ForceTwoStepVerification.Action'
] as const;

export const BLOCK_SESSION_LANGUAGE_RESOURCES = [
  'Denied.Header',
  'Denied.Body',
  'Denied.Action'
] as const;

export const getForceActionRedirectChallengeConfig = (
  forceActionRedirectChallengeType: ForceActionRedirectChallengeType
): ForceActionRedirectChallengeConfig => {
  switch (forceActionRedirectChallengeType) {
    case ForceActionRedirectChallengeType.ForceAuthenticator:
      return {
        redirectURLSignifier: 'forceauthenticator' as const,
        translationConfig: FORCE_AUTHENTICATOR_TRANSLATION_CONFIG,
        translationResourceKeys: FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES,
        getTranslationResources: (translate: ForceActionRedirectTranslateFunction) =>
          ({
            Header: translate('Header.TurnOnAuthenticator'),
            // TODO: Consolidate both of these description resources under a single resource.
            Body: `${translate('Description.SetupAuthenticator')}\n${translate(
              'Description.Reason'
            )}`,
            Action: translate('Action.Setup')
          } as const)
      };
    case ForceActionRedirectChallengeType.ForceTwoStepVerification:
      return {
        redirectURLSignifier: 'forcetwostepverification' as const,
        translationConfig: FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG,
        translationResourceKeys: FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES,
        getTranslationResources: (translate: ForceActionRedirectTranslateFunction) =>
          ({
            Header: translate('ForceTwoStepVerification.Header'),
            Body: translate('ForceTwoStepVerification.Body'),
            Action: translate('ForceTwoStepVerification.Action')
          } as const)
      };
    case ForceActionRedirectChallengeType.BlockSession:
      return {
        redirectURLSignifier: 'blocksession' as const,
        translationConfig: BLOCK_SESSION_TRANSLATION_CONFIG,
        translationResourceKeys: BLOCK_SESSION_LANGUAGE_RESOURCES,
        getTranslationResources: (translate: ForceActionRedirectTranslateFunction) =>
          ({
            Header: translate('Denied.Header'),
            Body: translate('Denied.Body'),
            Action: translate('Denied.Action')
          } as const)
      };
    default:
      throw new Error('Invalid ForceActionRedirectChallengeType');
  }
};
