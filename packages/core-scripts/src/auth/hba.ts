import { HbaMeta } from "./internal/types";

/**
 * Get hba metadata from meta tag
 */
export const hbaMeta = (): HbaMeta => {
  const metaTag = document.querySelector<HTMLElement>(
    'meta[name="hardware-backed-authentication-data"]',
  );
  const keyMap = metaTag?.dataset ?? {};
  return {
    isBoundAuthTokenEnabled: keyMap.isBoundAuthTokenEnabled === "true",
    boundAuthTokenWhitelist: keyMap.boundAuthTokenWhitelist ?? "",
    boundAuthTokenExemptlist: keyMap.boundAuthTokenExemptlist ?? "",
    hbaIndexedDBName: keyMap.hbaIndexedDbName ?? "",
    hbaIndexedDBObjStoreName: keyMap.hbaIndexedDbObjStoreName ?? "",
    hbaIndexedDBKeyName: keyMap.hbaIndexedDbKeyName ?? "",
    hbaIndexedDBVersion:
      keyMap.hbaIndexedDbVersion != null ? parseInt(keyMap.hbaIndexedDbVersion, 10) : 1,
    batEventSampleRate:
      keyMap.batEventSampleRate != null ? parseInt(keyMap.batEventSampleRate, 10) : 0,
    isSecureAuthenticationIntentEnabled: keyMap.isSecureAuthenticationIntentEnabled === "true",
  };
};
