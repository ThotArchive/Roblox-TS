import { TAuthIntent, TUserAuthIntent } from 'core-roblox-utilities';
import { CurrentUser } from 'Roblox';
import urlService from '../../../services/urlService';
import localStorageService from '../../../services/localStorageService/localStorageService';

const AUTHINTENTKEY = 'RBXAuthIntent';
const UNCLAIMEDUSERID = '-1';
const INTENTLIMIT = 20;
const RETURNURL = 'returnUrl';

// local functions
const getAuthIntentData = (): TAuthIntent => {
  return localStorageService.getLocalStorage(AUTHINTENTKEY) as TAuthIntent;
};

const deleteAuthIntentData = (): void => {
  localStorageService.removeLocalStorage(AUTHINTENTKEY);
};

const setAuthIntentData = (authIntent: TAuthIntent): void => {
  localStorageService.setLocalStorage(AUTHINTENTKEY, authIntent);
};

// utils functions
const addGameIdToUnClaimedAuthIntent = (gameId: string): void => {
  const authIntent =
    (localStorageService.getLocalStorage(AUTHINTENTKEY) as TAuthIntent) || ({} as TAuthIntent);
  const clientEpochTimestamp = Math.floor(Date.now() / 1000);

  let gameIntents = authIntent[UNCLAIMEDUSERID]?.game || [];
  gameIntents = gameIntents.filter(obj => obj.gameId !== gameId);
  gameIntents.push({ gameId, clientEpochTimestamp });

  if (gameIntents.length > INTENTLIMIT) {
    gameIntents.shift(); // remove the oldest intent
  }

  authIntent[UNCLAIMEDUSERID] = { ...authIntent[UNCLAIMEDUSERID], game: gameIntents };

  try {
    setAuthIntentData(authIntent);
  } catch (e) {
    console.error('Error setting AuthIntent data:', e);
  }
};

const saveGameIntentFromReturnUrl = (): void => {
  const url = urlService.getQueryParam(RETURNURL) as string;
  const regex = /\/games\/(\d+)\//;
  const match = regex.exec(url);
  if (match) {
    addGameIdToUnClaimedAuthIntent(match[1]);
  }
};

const saveGameIntentFromCurrentUrl = (): void => {
  const url = window.location.href;
  const regex = /\/games\/(\d+)\//;
  const match = regex.exec(url);
  if (match) {
    addGameIdToUnClaimedAuthIntent(match[1]);
  }
};
const hasUnclaimedAuthIntent = (): boolean => {
  const authIntent = localStorageService.getLocalStorage(AUTHINTENTKEY) as TAuthIntent;
  return !!(authIntent && authIntent[UNCLAIMEDUSERID]);
};
const retrieveAuthIntentDataForUser = (): TUserAuthIntent => {
  if (CurrentUser.userId) {
    return getAuthIntentData() && getAuthIntentData()[CurrentUser.userId];
  }
};

const applyUserAuthIntent = (userId: string): void => {
  const authIntent = localStorageService.getLocalStorage(AUTHINTENTKEY) as TAuthIntent;
  if (authIntent && authIntent[UNCLAIMEDUSERID]) {
    authIntent[userId] = authIntent[UNCLAIMEDUSERID];
    delete authIntent[UNCLAIMEDUSERID];
    setAuthIntentData(authIntent);
  }
};

export default {
  addGameIdToUnClaimedAuthIntent,
  applyUserAuthIntent,
  retrieveAuthIntentDataForUser,
  saveGameIntentFromReturnUrl,
  saveGameIntentFromCurrentUrl,
  hasUnclaimedAuthIntent
};
