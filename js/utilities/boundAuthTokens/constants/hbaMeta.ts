/**
 * A util function to get Hba settings
 * Exposed in Roblox Core Utility DataStore
 */

import { THbaMeta } from 'Roblox';
/**
 * Get hba metadata from meta tag
 *
 * @returns {THbaMeta}
 */
export const getHbaMeta = (): THbaMeta => {
  const metaTag = document.querySelector<HTMLElement>(
    'meta[name="hardware-backed-authentication-data"]'
  );
  const keyMap = metaTag?.dataset || {};
  return {
    isBoundAuthTokenEnabled: keyMap.isBoundAuthTokenEnabled === 'true',
    boundAuthTokenWhitelist: keyMap.boundAuthTokenWhitelist || '',
    boundAuthTokenExemptlist: keyMap.boundAuthTokenExemptlist || '',
    hbaIndexedDBName: keyMap.hbaIndexedDbName || '',
    hbaIndexedDBObjStoreName: keyMap.hbaIndexedDbObjStoreName || '',
    hbaIndexedDBKeyName: keyMap.hbaIndexedDbKeyName || '',
    hbaIndexedDBVersion: parseInt(keyMap.hbaIndexedDbVersion, 10) || 1,
    batEventSampleRate: parseInt(keyMap.batEventSampleRate, 10) || 0,
    isSecureAuthenticationIntentEnabled: keyMap.isSecureAuthenticationIntentEnabled === 'true'
  };
};

export default {
  getHbaMeta
};
