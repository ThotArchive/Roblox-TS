import { localStorageService } from 'core-roblox-utilities';
import { authenticatedUser, deviceMeta } from 'header-scripts';
import globalPrivacyControlConstants, {
  GlobalPrivacyControlLocalStorage,
  GlobalPrivacyControlUserStorage
} from '../constants/globalPrivacyControlConstants';
import universalAppConfigurationService from '../services/universalAppConfigurationService';
import userSettingsApi from '../services/userSettingsApi';

const handleGlobalPrivacyControl = async (nowDate: Date) => {
  /**
   * Preamble, GPC has no effect if any of these happen
   * Because globalPrivacyControl is still experimental, it does not exist as a strict type yet.
   * */
  const gpcValue = navigator.globalPrivacyControl;
  if (!gpcValue) {
    return;
  }

  // Don't show the prompt if in the Webview of Universal App
  const inApp = deviceMeta?.getDeviceMeta()?.isInApp ?? false;
  if (inApp) {
    return;
  }

  const { isAuthenticated } = authenticatedUser;

  // We shouldn't try to issue Global Privacy Control for logged-out users
  if (!isAuthenticated) {
    return;
  }

  /**
   * Get the config data
   * */
  let serverGpcVersion;
  let serverCooldownInMs;
  let serverCooldownPeriodFuzzyInMs;

  try {
    const userSettingsGlobalPrivacyControlConfig = await universalAppConfigurationService.getUserSettingsGlobalPrivacyControlGuacPolicy();
    serverGpcVersion = userSettingsGlobalPrivacyControlConfig.data.gpcVersion;
    serverCooldownInMs = userSettingsGlobalPrivacyControlConfig.data.cooldownPeriodInMs;
    serverCooldownPeriodFuzzyInMs =
      userSettingsGlobalPrivacyControlConfig.data.cooldownPeriodFuzzyInMs;
  } catch (e) {
    // In the case of errors contacting GUAC, fall back to a sane default value
    serverGpcVersion = globalPrivacyControlConstants.unknownGpcVersion;
    serverCooldownInMs = globalPrivacyControlConstants.defaultCooldownInMs;
    serverCooldownPeriodFuzzyInMs = globalPrivacyControlConstants.defaultCooldownPeriodFuzzyInMs;
  }

  /**
   * Assess if local device data exists
   * */
  let parsedCachedGlobalPrivacyControlStatus: GlobalPrivacyControlLocalStorage;
  try {
    // localStorageService.getLocalStorage does an implicit JSON.parse, which can throw an exception
    parsedCachedGlobalPrivacyControlStatus = localStorageService.getLocalStorage(
      globalPrivacyControlConstants.globalPrivacyStatusLocalStorageKey
    ) as GlobalPrivacyControlLocalStorage;
  } catch (e) {
    // Shouldn't happen, but if the local storage data was somehow corrupted, we'll just do a fresh query
    if (e instanceof SyntaxError) {
      parsedCachedGlobalPrivacyControlStatus = {};
    }

    // JSON.parse should never throw anything other than SyntaxError
    throw e;
  }

  /**
   * If local device data exists, look for local user data.
   * The local user data may cause us to return because it is not time to check GPC again.
   * */
  if (parsedCachedGlobalPrivacyControlStatus) {
    const { id } = authenticatedUser;
    const userGlobalPrivacyControlStatus = parsedCachedGlobalPrivacyControlStatus[id];

    /**
     * If we have seen this user before, check versions and see if we should process the user's data
     * */
    if (userGlobalPrivacyControlStatus) {
      const nextTimeToCheckAsISOString = userGlobalPrivacyControlStatus.nextTimeToCheck;
      try {
        const nextTimeToCheckInMs = Date.parse(nextTimeToCheckAsISOString);

        // Check for cooldown value corruption
        if (Number.isFinite(nextTimeToCheckInMs)) {
          const nowInMs = nowDate.getTime();
          const { gpcVersion } = userGlobalPrivacyControlStatus;

          // Check for GPC value corruption
          if (Number.isFinite(gpcVersion)) {
            // If the GlobalPrivacyControl versions don't match, we may need to process a new update.
            if (gpcVersion === serverGpcVersion) {
              // Check if the cooldown has expired, and skip processing GPC if the cooldown time has not been reached
              if (nextTimeToCheckInMs > nowInMs) {
                return;
              }
            }
          }
        }
      } catch (e) {
        // Data corrupted, just assume we should process GPC.
        console.error(`Error with local storage, proceeding with globalPrivacyControl`);
      }
    }
  }

  /**
   * By reaching this point, we need to process GPC
   * */

  try {
    await userSettingsApi.setGlobalPrivacyControl();
  } catch (error) {
    // 400 = bad request
    // 500 = internal error
    // Since we only write an update if we got 200, a failure will be a retry since the conditions for trying in the first place will still be met next time.
    console.error(`Error setting globalPrivacyControl`);
    return;
  }

  try {
    // We want to reuse the existing data from storage to preserve notes on other users, but if no existing data is there, create a new one.
    if (parsedCachedGlobalPrivacyControlStatus === null) {
      parsedCachedGlobalPrivacyControlStatus = {} as GlobalPrivacyControlLocalStorage;
    }

    const nowInMs = nowDate.getTime();
    const minimumCooldownInMs = nowInMs + serverCooldownInMs;
    const fuzzyInMs = Math.floor(Math.random() * serverCooldownPeriodFuzzyInMs);
    const nextTimeToCheckInMs = minimumCooldownInMs + fuzzyInMs;
    const nextTimeToCheckAsDate = new Date(nextTimeToCheckInMs);

    const userDataToCache = {} as GlobalPrivacyControlUserStorage;
    userDataToCache.gpcVersion = serverGpcVersion;
    userDataToCache.nextTimeToCheck = nextTimeToCheckAsDate.toISOString();

    const { id } = authenticatedUser;
    parsedCachedGlobalPrivacyControlStatus[id] = userDataToCache;

    // If too many in cache, delete the one with the earliest cooldown
    if (
      Object.keys(parsedCachedGlobalPrivacyControlStatus).length >
      globalPrivacyControlConstants.maximumCooldownsCached
    ) {
      let idToDelete = null;
      let earliestCooldown = Infinity;
      // Skip the current user because we always want to retain them in order to avoid being in a loop
      Object.keys(parsedCachedGlobalPrivacyControlStatus)
        .filter(key => Number(key) !== id)
        .forEach(key => {
          const keyAsNumber = Number(key);
          const statusCooldownInMs = Date.parse(
            parsedCachedGlobalPrivacyControlStatus[keyAsNumber].nextTimeToCheck
          );

          if (statusCooldownInMs < earliestCooldown) {
            idToDelete = keyAsNumber;
            earliestCooldown = statusCooldownInMs;
          }
        });

      if (idToDelete) {
        delete parsedCachedGlobalPrivacyControlStatus[idToDelete];
      }
    }

    // localStorage.setItem, which localStorageService.setLocalStorage calls, will throw an exception if storage is full
    localStorageService.setLocalStorage(
      globalPrivacyControlConstants.globalPrivacyStatusLocalStorageKey,
      parsedCachedGlobalPrivacyControlStatus
    );
  } catch (e: any) {
    console.error(`Error updating local storage for handleGlobalPrivacyControl`);
    // Shouldn't happen, but if the local storage data was somehow corrupted, we'll just clear it out
    if (e instanceof SyntaxError) {
      localStorageService.removeLocalStorage(
        globalPrivacyControlConstants.globalPrivacyStatusLocalStorageKey
      );
      return;
    }

    // JSON.parse should never throw anything other than SyntaxError
    throw e;
  }
};

export default {
  handleGlobalPrivacyControl
};
