import environmentUrls from "@rbx/environment-urls";

export const getUserProfileUrl = (userId: number): string =>
  `${environmentUrls.websiteUrl}/users/${userId}/profile`;

export const getUserFriendsUrl = (userId: string): string =>
  `${environmentUrls.friendsApi}/v1/users/${userId}/friends`;

export const getUsersPresenceUrl = (): string => `${environmentUrls.presenceApi}/v1/presence/users`;

export const getUserFollowersUrl = (userId: string): string =>
  `${environmentUrls.friendsApi}/v1/users/${userId}/followers`;

export const getUserFollowingsUrl = (userId: string): string =>
  `${environmentUrls.friendsApi}/v1/users/${userId}/followings`;

export const getUserRequestUrl = (): string =>
  `${environmentUrls.friendsApi}/v1/my/friends/requests`;

export const types = {
  FRIENDS: "friends",
  FOLLOWERS: "followers",
  FOLLOWINGS: "followings",
  FRIENDREQUESTS: "friendrequests",
} as const;

export type DataKey = (typeof types)[keyof typeof types];
