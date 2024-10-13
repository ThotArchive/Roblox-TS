import { DeviceMeta } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import agreementConstants from '../constants/agreementConstants';
import universalAppConfigurationService from '../services/universalAppConfigurationService';

// Agreement data is cached in the following format:
// {
//   lastFetchTimestamp - ISO8601 timestamp indicating when the browser last queried the
//     agreement resolution endpoint
//   doesUserNeedToAcceptAgreements - true if
//     1) the user has triggered a call to the agreement resolution endpoint, but hasn't accepted the
//     outstanding agreements yet
//       OR
//     2) the cooldown period for making another agreement resolution call has expired (it's possible
//     that new agreements were added in the service in the interim, so we need to make another call)
// }

const shouldFetchAgreements = async nowDate => {
  // Don't show the prompt if in the Webview of Universal App
  const inApp = DeviceMeta ? DeviceMeta().isInApp : false;
  if (inApp) {
    return false;
  }

  let parsedCachedAgreementData;

  const { isAuthenticated } = authenticatedUser;

  // We shouldn't try to fetch agreements (nor show the prompt) for logged-out users
  if (!isAuthenticated) {
    return false;
  }

  try {
    // localStorageService.getLocalStorage does an implicit JSON.parse, which can throw an exception
    parsedCachedAgreementData = localStorageService.getLocalStorage(
      agreementConstants.agreementLocalStorageKey
    );
  } catch (e) {
    // Shouldn't happen, but if the local storage data was somehow corrupted, we'll just do a fresh query
    if (e instanceof SyntaxError) {
      return true;
    }

    // JSON.parse should never throw anything other than SyntaxError
    throw e;
  }

  // First time doing this check, or the localStorage entry was manually cleared
  if (parsedCachedAgreementData === null) {
    return true;
  }

  const { lastFetchTimestamp } = parsedCachedAgreementData;
  const parsedLastFetchTimestampInMs = Date.parse(lastFetchTimestamp);

  // Shouldn't happen, but if the local storage data was somehow corrupted, we'll just do a fresh query
  if (Number.isNaN(parsedLastFetchTimestampInMs)) {
    return true;
  }

  const { doesUserNeedToAcceptAgreements } = parsedCachedAgreementData;

  // This value is set to true if outstanding agreements are fetched from UAQS, and set to false when
  // the user accepts them
  if (doesUserNeedToAcceptAgreements) {
    return true;
  }

  const nowInMs = nowDate.getTime();
  let cooldownInMs;

  try {
    const userAgreementsBehavior = await universalAppConfigurationService.getCooldownPeriodInMs();
    cooldownInMs = userAgreementsBehavior.data.cooldownPeriodInMs;
  } catch (e) {
    // In the case of errors contacting GUAC, fall back to a sane default value
    cooldownInMs = agreementConstants.defaultCooldownInMs;
  }

  // The user doesn't have pending agreements to accept according to localStorage, but the cooldown
  // period may have expired
  return nowInMs > parsedLastFetchTimestampInMs + cooldownInMs;
};

// If nowDate is not a Date, we'll preserve whatever lastFetchTimestamp is already in the cache
const updateDoesUserNeedToAcceptAgreements = (doesUserNeedToAcceptAgreements, nowDate = null) => {
  // If doesUserNeedToAcceptAgreements is true, then we just made a query and therefore must
  // update the cached lastFetchTimestamp
  if (doesUserNeedToAcceptAgreements && !(nowDate instanceof Date)) {
    throw new TypeError('if doesUserNeedToAcceptAgreements is true then must provide a valid Date');
  }

  const dataToCache = {
    // The lastFetchTimestamp to cache is determined below
    doesUserNeedToAcceptAgreements
  };

  if (!(nowDate instanceof Date)) {
    let parsedCachedAgreementData;

    try {
      // localStorageService.getLocalStorage does an implicit JSON.parse, which can throw an exception
      parsedCachedAgreementData = localStorageService.getLocalStorage(
        agreementConstants.agreementLocalStorageKey
      );
      dataToCache.lastFetchTimestamp = parsedCachedAgreementData.lastFetchTimestamp;
    } catch (e) {
      // Shouldn't happen, but if the local storage data was somehow corrupted, we'll just clear it out
      if (e instanceof SyntaxError) {
        localStorageService.removeLocalStorage(agreementConstants.agreementLocalStorageKey);
        return;
      }

      // JSON.parse should never throw anything other than SyntaxError
      throw e;
    }
  } else {
    dataToCache.lastFetchTimestamp = nowDate.toISOString();
  }

  try {
    // localStorage.setItem, which localStorageService.setLocalStorage calls, will throw an exception if storage is full
    localStorageService.setLocalStorage(agreementConstants.agreementLocalStorageKey, dataToCache);
  } catch (e) {
    console.error(`Error updating doesUserNeedToAcceptAgreements ${e}`);
  }
};

export default {
  shouldFetchAgreements,
  updateDoesUserNeedToAcceptAgreements
};
