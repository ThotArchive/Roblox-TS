import { get, buildBatchPromises } from "../../http";
import localStorageService from "../../local-storage";
import { friendsDict as friendsDictKey } from "../../local-storage/keys";
import {
  DataKey,
  getUserFollowersUrl,
  getUserFollowingsUrl,
  getUserFriendsUrl,
  getUserProfileUrl,
  getUserRequestUrl,
  getUsersPresenceUrl,
} from "./constants";
import { FriendObject, PresenceObject } from "../../data-store/stores/userData/userDataConstants";

const { CurrentUser } = window.Roblox;

const BATCH_LIMIT = 100;

const URL_MAP = {
  friends: getUserFriendsUrl,
  followers: getUserFollowersUrl,
  followings: getUserFollowingsUrl,
  friendrequests: getUserRequestUrl,
};

const removeFriendsDictCache = (type: string) => {
  document.addEventListener("Roblox.Logout", () => {
    localStorageService.removeLocalStorage(friendsDictKey(type));
  });
};

export const fetchFromNetwork = async (
  friendsDict: Partial<Record<DataKey, Record<string, FriendObject>>>,
  type: DataKey,
  cacheEnabled?: boolean,
): Promise<Record<string, FriendObject>> => {
  const friendsApi = {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: URL_MAP[type](CurrentUser!.userId),
    retryable: true,
    withCredentials: true,
  };

  const presenceApi = {
    url: getUsersPresenceUrl(),
    retryable: true,
    withCredentials: true,
  };

  const result = await get<{ data?: FriendObject[] }>(friendsApi);
  const friends = result.data.data ?? [];
  const userIds: number[] = [];
  const friendsMap: Record<string, FriendObject> = {};
  // TODO: old, migrated code
  // eslint-disable-next-line no-param-reassign
  friendsDict[type] = friendsMap;

  for (const friend of friends) {
    const userId = friend.id;
    userIds.push(userId);
    friend.profileUrl = getUserProfileUrl(userId);
    friendsMap[userId] = friend;
  }

  const data = await buildBatchPromises<PresenceObject>(
    userIds,
    BATCH_LIMIT,
    presenceApi,
    true,
    "userIds",
  );

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (data?.length > 0) {
    data
      .flatMap(d => d.data.userPresences)
      .forEach(presence => {
        // @ts-expect-error TODO: old, migrated code
        friendsMap[presence.userId].presence = presence;
      });
  }

  if (cacheEnabled) {
    localStorageService.saveDataByTimeStamp(friendsDictKey(type), friendsDict[type]);
    removeFriendsDictCache(type);
  }

  return friendsMap;
};
