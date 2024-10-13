export type GlobalPrivacyControlUserStorage = {
  gpcVersion: number;
  nextTimeToCheck: string;
};

export type GlobalPrivacyControlLocalStorage = {
  [userId: number]: GlobalPrivacyControlUserStorage;
};

// Due to experimental nature, the boolean does not exist in standard Navigator objects.
declare global {
  interface Navigator {
    globalPrivacyControl: boolean;
  }
}

export default {
  globalPrivacyStatusLocalStorageKey: 'Roblox.UserSettings.GlobalPrivacyControl',
  unknownGpcVersion: -1, // If call to GUAC fails, respect GPC anyways. This has the effect that after being able to contact GUAC, there will be an additional call.
  defaultCooldownInMs: 24 * 60 * 60 * 1000, // 24 hours; Only used if the call to GUAC fails. See universalAppConfigurationService for doc details.
  defaultCooldownPeriodFuzzyInMs: 24 * 60 * 60 * 1000, // 24 hours; Only used if the call to GUAC fails. See universalAppConfigurationService for doc details.
  maximumCooldownsCached: 10 // How many GlobalPrivacyControlUserStorage cooldowns to cache, to limit the amount of localStorage used.
};
