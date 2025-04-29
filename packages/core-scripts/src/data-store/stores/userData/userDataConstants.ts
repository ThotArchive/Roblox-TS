import environmentUrls from "@rbx/environment-urls";

const { friendsApi, presenceApi, usersApi } = environmentUrls;

export type UserDataRequest = {
  userId: number;
  isGuest: boolean;
  cursor?: number;
  sortOrder?: string;
  userSort?: string;
  limit?: number;
  fetchMutualFriends?: boolean;
};

export type UserPresence = { userId: number };
export type PresenceObject = { userPresences: UserPresence[] };
export type FriendObject = { id: number; profileUrl: string; presence: object };
export type UserObject = { id: number };

export type FriendsRes = {
  data: FriendObject[];
  previousPageCursor: string;
  nextPageCursor: string;
};
export type FriendsData = Record<string, FriendObject>;
export type FriendResult = {
  userData: FriendObject[];
  prevCursor?: string;
  nextCursor?: string;
};

export type UserQueueItem = {
  userId: number;
};

export const getFriendsApiUrl = (userId: number, name: string): string =>
  `${friendsApi}/v1/users/${userId}/${name}`;

export const getFriendsRequestUrl = (): string => `${friendsApi}/v1/my/friends/requests`;

export const getUserPresenceUrl = (): string => `${presenceApi}/v1/presence/users`;

export const getUsersUrl = (): string => `${usersApi}/v1/users`;

export enum MethodType {
  Friends = "friends",
  Followers = "followers",
  Followings = "followings",
  Requests = "requests",
}

export enum FriendsUserSortType {
  Alphabetical = "Alphabetical",
  StatusAlphabetical = "StatusAlphabetical",
  StatusFrequents = "StatusFrequents",
}

export const DefaultExpirationWindowMS = 30000; // 30s

export const DefaultUserBatchSize = 100;

export const DefaultUserProcessBatchWaitTime = 1000;

export const MaxFriendRequestNotificationCount = 500;

export const MaxMessagesNotificationCount = 500;
