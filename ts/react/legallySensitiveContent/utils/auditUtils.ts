import { cryptoUtil } from 'core-roblox-utilities';
import { TranslateFunction } from 'react-utilities';
import UserSetting from '../enums/UserSetting';
import { TAuditData } from '../types/legallySensitiveContentTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';

/**
 * Creates audit data for consent forms.
 * This function generates audit data based on the setting name and translation function.
 *
 * @param {UserSetting} setting - The setting name to generate audit data for
 * @param {TranslateFunction} translate - Function to translate text
 * @returns {TAuditData[]} Array of audit data objects
 */
export const getAuditDataForConsent = (
  setting: UserSetting,
  translate: TranslateFunction
): TAuditData[] => {
  switch (setting) {
    case UserSetting.phoneNumberDiscoverability:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverability.consentTranslationKey,
            { linkStart: '{linkStart}', linkEnd: '{linkEnd}' }
          ),
          vars: {
            // TODO: Example for testing purposes
            linkStart: `<a href="www.roblox.com"">`,
            linkEnd: '</a>'
          },
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverability.sourceContentId
        }
      ];
    default:
      return [];
  }
};

/**
 * Creates an audit header value from an array of audit data.
 * Each item in the array is hashed and combined with its vars into a single object.
 *
 * @param {TAuditData[]} auditData - Array of audit data to be included in the header
 * @returns {string} JSON string containing the audit header data
 */
export const getAuditHeaderValue = (auditData: TAuditData[]): string => {
  return JSON.stringify({
    content: auditData.reduce(
      (acc, data) => ({
        ...acc,
        [data.sourceContentId]: {
          hash: cryptoUtil.hashStringWithFnv1a32(data.consentStringTemplate),
          ...data.vars
        }
      }),
      {}
    )
  });
};
