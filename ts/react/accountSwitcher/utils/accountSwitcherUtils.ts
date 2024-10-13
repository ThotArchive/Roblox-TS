/**
 * A util lib for account switching settings and data.
 */
import { localStorageService } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import { ExperimentationService } from 'Roblox';
import { memoize } from 'lodash';
import {
  accountSwitchServiceErrorCodes,
  accountSwitcherBlobKey,
  accountSwitcherBlobSyncedKey,
  accountSwitcherLayerName,
  accountSwitcherMaxAccounts
} from '../constants/accountSwitcherConstants';
import { getLoggedInUsersMetadata } from '../services/accountSwitcherService';
import { postUsersInfo } from '../../common/services/usersService';
import { TUserData } from '../../common/types/userTypes';
import {
  TGetLoggedInUsersMetadataResponse,
  TLoggedInUsers,
  TSwitchResponse
} from '../../common/types/accountSwitcherTypes';
import { sendAuthClientErrorEvent } from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

/**
 * Check if account switching is enabled in account switching metadata from meta tag
 *
 * @returns {boolean}
 */
export const isAccountSwitchingEnabled = (): boolean => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="account-switching-data"]');
  const keyMap = metaTag?.dataset || {};
  return keyMap.isAccountSwitchingEnabled === 'true';
};

export const getStoredAccountSwitcherBlob = (): string => {
  if (!isAccountSwitchingEnabled()) {
    return '';
  }
  try {
    return localStorageService.getLocalStorage(accountSwitcherBlobKey) as string;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageGetFailure
    );
    return '';
  }
};

export const storeAccountSwitcherBlob = (blob: string): void => {
  if (!isAccountSwitchingEnabled()) {
    return;
  }
  try {
    localStorageService.setLocalStorage(accountSwitcherBlobKey, blob);
    localStorageService.setLocalStorage(accountSwitcherBlobSyncedKey, true);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageSetFailure
    );
  }
};

export const deleteAccountSwitcherBlob = (): void => {
  try {
    // Allowing deletion even if the feature is turned off for privacy reason
    localStorageService.removeLocalStorage(accountSwitcherBlobKey);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageRemoveFailure
    );
  }
};

export const hasAccountSwitcherInvalidSessionError = (switchResponse: TSwitchResponse): boolean => {
  const { errors } = switchResponse;
  if (!errors) {
    return false;
  }

  const hasInvalidSessionError = errors.some(
    error => error.code === accountSwitchServiceErrorCodes.InvalidSession
  );
  return hasInvalidSessionError;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const memoizedGetAccountSwitchingExperimentValue = memoize(
  async (): Promise<boolean> => {
    try {
      const experimentParameterValues = await ExperimentationService?.getAllValuesForLayer(
        accountSwitcherLayerName
      );
      // TODO when shipping Account Switching broadly, return true instead of the statement below
      return !!experimentParameterValues?.isAccountSwitcherEnabled;
    } catch (e) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-call
      console.info('Failed to get experiment parameter values for Account Switching', e);
      return false;
    }
  }
) as () => Promise<boolean>;

/**
 * Check if user is not U13 and account switching is enabled and a blob is available.
 *
 * @returns {{Promise<boolean>}}
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const isAccountSwitcherAvailable = async (): Promise<boolean> => {
  if (!isAccountSwitchingEnabled()) {
    return false;
  }
  if (authenticatedUser?.isAuthenticated && authenticatedUser?.isUnder13) {
    return false;
  }
  const blob = getStoredAccountSwitcherBlob();
  if (blob !== null && blob.trim() !== '') {
    // if the settings are enabled, having a blob always means that the browser can use Account Switching
    return true;
  }

  if (!authenticatedUser?.isAuthenticated) {
    // if the user is not authenticated and has no blob, account switching is not available. Skip experiment call
    return false;
  }
  return memoizedGetAccountSwitchingExperimentValue();
};

const parseUserMetaData = async (
  removeInvalidActiveUser: boolean
): Promise<[TGetLoggedInUsersMetadataResponse, boolean]> => {
  const blob = getStoredAccountSwitcherBlob();
  let userMetaData = {} as TGetLoggedInUsersMetadataResponse;
  let isAccountLimitReached = false;
  if (!authenticatedUser.isAuthenticated && !blob) {
    // early return if user is not authed and blob is empty, to skip network calls
    // there are no accounts in the switcher and no accounts could be added
    return [userMetaData, isAccountLimitReached];
  }
  // exclude authenticated U13 accounts
  if (!(authenticatedUser.isAuthenticated && authenticatedUser.isUnder13)) {
    try {
      userMetaData = await getLoggedInUsersMetadata({
        encrypted_users_data_blob: blob,
        remove_invalid_active_user: removeInvalidActiveUser
      });

      if (userMetaData) {
        storeAccountSwitcherBlob(userMetaData.encrypted_users_data_blob);

        let numOfLoggedInAccounts = userMetaData.logged_in_users_metadata.length;
        if (
          userMetaData.active_user_id &&
          authenticatedUser.isAuthenticated &&
          userMetaData.active_user_id !== authenticatedUser.id.toString()
        ) {
          numOfLoggedInAccounts += 1;
        }
        isAccountLimitReached = numOfLoggedInAccounts >= accountSwitcherMaxAccounts;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Parse user meta data failed!', e);
      throw e; // re-throw so that caller can show error to users
    }
  }
  return [userMetaData, isAccountLimitReached];
};

/**
 * Helper function to parse logged in users.
 * It gets the list of user meta data from getLoggedInUsersMetaData and uses the ids returned to get user info such as username and display names.
 *
 * @returns {TAccountSwitcherMeta} which contains info such as active user, logged out user, isAccountLimitReached, and other logged in users.
 */
export const parseLoggedInUsers = async (
  removeInvalidActiveUser: boolean,
  shouldFetchUserInfo = true
): Promise<TLoggedInUsers> => {
  let loggedOutUser;
  let activeUser;
  let usersAvailableForSwitching = [] as TUserData[];
  let loggedOutUserId = -1;

  if (!(await isAccountSwitcherAvailable())) {
    return {
      activeUser,
      usersAvailableForSwitching,
      isAccountLimitReached: false,
      loggedOutUser
    };
  }

  const [userMetaData, isAccountLimitReached] = await parseUserMetaData(removeInvalidActiveUser);
  if (userMetaData) {
    try {
      const userIds: Array<string> = [];
      if (userMetaData.removed_user_metadata && userMetaData.removed_user_metadata.user_id !== '') {
        loggedOutUserId = Number(userMetaData.removed_user_metadata.user_id);
        userIds.push(userMetaData.removed_user_metadata.user_id);
      }
      if (userMetaData.logged_in_users_metadata) {
        userMetaData.logged_in_users_metadata.forEach(user => {
          userIds.push(user.user_id);
        });
      }

      let users = [] as TUserData[];
      if (shouldFetchUserInfo) {
        users = await postUsersInfo(userIds);
        if (users) {
          if (userMetaData.active_user_id !== '') {
            activeUser = users.find(user => user.id.toString() === userMetaData.active_user_id);
          }
          if (loggedOutUserId !== -1) {
            loggedOutUser = users.find(user => user.id === loggedOutUserId);
          }
          usersAvailableForSwitching = users.filter(
            user =>
              user.id !== loggedOutUserId && user.id.toString() !== userMetaData.active_user_id
          );
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Getting user info failed!', e);
      sendAuthClientErrorEvent(
        EVENT_CONSTANTS.context.accountSwitcherBackendRequestFailure,
        EVENT_CONSTANTS.clientErrorTypes.userInfoFetchFailed
      );
      throw e;
    }
  }
  return {
    activeUser,
    usersAvailableForSwitching,
    isAccountLimitReached,
    loggedOutUser
  };
};

export const syncAccountSwitcherBlobIfNeeded = async (): Promise<void> => {
  try {
    if (localStorageService.getLocalStorage(accountSwitcherBlobSyncedKey) as boolean) {
      return;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageGetFailure
    );
    return;
  }
  const blob = getStoredAccountSwitcherBlob();
  if (blob !== null && blob.trim() !== '') {
    await parseLoggedInUsers(false, false);
  }
};

export default {
  isAccountSwitchingEnabled,
  isAccountSwitcherAvailable,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded
};
