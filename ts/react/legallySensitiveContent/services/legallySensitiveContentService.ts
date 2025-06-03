import { TranslateFunction } from 'react-utilities';
import { UserSetting } from '../enums/UserSetting';
import {
  TLegallySensitiveData,
  TLegallySensitiveActions
} from '../types/legallySensitiveContentTypes';
import { SettingValue } from '../types/settingTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import { updateUserSetting } from './userSettingsService';
import { getAuditDataForConsent } from '../utils/auditUtils';

/**
 * Hook for managing legally sensitive content and actions.
 * This hook provides a standardized way to handle legally sensitive content,
 * such as consent forms and user settings updates with audit logs.
 *
 * @param {TranslateFunction} translate - Function to translate text
 * @param {UserSetting} settingName - The name of the setting being updated
 * @returns {[TLegallySensitiveData, TLegallySensitiveActions]} Tuple containing:
 *   - Legally sensitive data (consent text and form type)
 *   - Actions for updating settings with audit logs
 */
export const useTranslatedLegallySensitiveContentAndActions = (
  translate: TranslateFunction,
  settingName: UserSetting
): [TLegallySensitiveData, TLegallySensitiveActions] => {
  const getLegallySensitiveData = (setting: UserSetting): TLegallySensitiveData => {
    let languageConstants;
    switch (setting) {
      case UserSetting.phoneNumberDiscoverability:
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverability;
        return {
          wordsOfConsent: translate(languageConstants.consentTranslationKey, {
            linkStart: `<a href="www.roblox.com"">`,
            linkEnd: '</a>'
          })
        };

      default:
        return undefined;
    }
  };

  const updateSettingWithAuditing = async (
    setting: UserSetting,
    settingValue: SettingValue,
    additionalContextualData?: string
  ) => {
    const auditData = getAuditDataForConsent(setting, translate);
    try {
      await updateUserSetting(setting, settingValue, auditData);
    } catch (error) {
      // TODO: Add error handling
    }
  };

  const legallySensitiveData = getLegallySensitiveData(settingName);
  const legallySensitiveActions: TLegallySensitiveActions = {
    updateSettingWithAuditing
  };

  return [legallySensitiveData, legallySensitiveActions];
};

export default useTranslatedLegallySensitiveContentAndActions;
