import { getQueryParam } from "../../../util/url";
import localStorage from "../../../local-storage";

const { CurrentUser } = window.Roblox;

export type GameIntent = {
  gameId: string;
  clientEpochTimestamp: number;
};

export type UserAuthIntent = {
  game: GameIntent[];
};

export type AuthIntent = Record<string, UserAuthIntent>;

const AUTHINTENTKEY = "RBXAuthIntent";
const UNCLAIMEDUSERID = "-1";
const INTENTLIMIT = 20;
const RETURNURL = "returnUrl";

// local functions
const getAuthIntentData = (): AuthIntent =>
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  (localStorage.getLocalStorage(AUTHINTENTKEY) as AuthIntent | undefined) ?? {};

const setAuthIntentData = (authIntent: AuthIntent): void => {
  localStorage.setLocalStorage(AUTHINTENTKEY, authIntent);
};

// utils functions
const addGameIdToUnClaimedAuthIntent = (gameId: string): void => {
  const authIntent = getAuthIntentData();
  const clientEpochTimestamp = Math.floor(Date.now() / 1000);

  let gameIntents = authIntent[UNCLAIMEDUSERID]?.game ?? [];
  gameIntents = gameIntents.filter(obj => obj.gameId !== gameId);
  gameIntents.push({ gameId, clientEpochTimestamp });

  if (gameIntents.length > INTENTLIMIT) {
    gameIntents.shift(); // remove the oldest intent
  }

  authIntent[UNCLAIMEDUSERID] = { ...authIntent[UNCLAIMEDUSERID], game: gameIntents };

  try {
    setAuthIntentData(authIntent);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error setting AuthIntent data:", e);
  }
};

const saveGameIntentFromReturnUrl = (): void => {
  // `RETURNURL` is a single param constant
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const url = getQueryParam(RETURNURL) as string;
  const regex = /\/games\/(\d+)\//;
  const match = regex.exec(url);
  if (match?.[1]) {
    addGameIdToUnClaimedAuthIntent(match[1]);
  }
};

const saveGameIntentFromCurrentUrl = (): void => {
  const url = window.location.href;
  const regex = /\/games\/(\d+)\//;
  const match = regex.exec(url);
  if (match?.[1]) {
    addGameIdToUnClaimedAuthIntent(match[1]);
  }
};
const hasUnclaimedAuthIntent = (): boolean => getAuthIntentData()[UNCLAIMEDUSERID] != null;

// @ts-expect-error TODO: old, migrated code
// eslint-disable-next-line consistent-return
const retrieveAuthIntentDataForUser = (): UserAuthIntent => {
  if (CurrentUser?.userId) {
    // @ts-expect-error TODO: old, migrated code
    return getAuthIntentData()[CurrentUser.userId];
  }
};

const applyUserAuthIntent = (userId: string): void => {
  const authIntent = getAuthIntentData();
  if (authIntent[UNCLAIMEDUSERID] != null) {
    authIntent[userId] = authIntent[UNCLAIMEDUSERID];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
  hasUnclaimedAuthIntent,
};
