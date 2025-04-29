import { UrlConfig } from "../../../http";
import {
  getFriendsApiUrl,
  getFriendsRequestUrl,
  getUserPresenceUrl,
  UserDataRequest,
  PresenceObject,
  FriendObject,
  FriendsData,
  MethodType,
} from "./userDataConstants";

export const populateFriendsData = (friends: FriendObject[]): FriendsData => {
  const friendsData: FriendsData = {};
  for (const friend of friends) {
    friend.profileUrl = `/users/${friend.id}/profile`;
    friend.presence = {};
    friendsData[friend.id] = friend;
  }
  return friendsData;
};

export const populatePresenceData = (
  friendsData: FriendsData,
  presenceData: PresenceObject,
): FriendsData => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (presenceData.userPresences?.length > 0) {
    for (const userPresence of presenceData.userPresences) {
      // @ts-expect-error TODO: old, migrated code
      // eslint-disable-next-line no-param-reassign
      friendsData[userPresence.userId].presence = userPresence;
    }
  }
  return friendsData;
};

export const getFriendsUrlConfig = (methodName: MethodType, userId: number): UrlConfig => {
  let url = getFriendsApiUrl(userId, methodName);
  if (methodName === MethodType.Requests) {
    url = getFriendsRequestUrl();
  }
  return {
    url,
    retryable: true,
    withCredentials: true,
  };
};

export const getFriendsParams = ({
  cursor,
  sortOrder,
  userSort,
  limit,
  fetchMutualFriends,
}: UserDataRequest): Record<string, string | number | boolean> => {
  const params = {};
  if (cursor) {
    Object.assign(params, { cursor });
  }
  if (sortOrder) {
    Object.assign(params, { sortOrder });
  }
  if (userSort) {
    Object.assign(params, { userSort });
  }
  if (limit) {
    Object.assign(params, { limit });
  }
  if (fetchMutualFriends) {
    Object.assign(params, { fetchMutualFriends });
  }
  return params;
};

export const getPresenceUrlConfig = (): UrlConfig => ({
  url: getUserPresenceUrl(),
  retryable: false,
  withCredentials: true,
});
