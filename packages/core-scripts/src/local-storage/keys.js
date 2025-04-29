const { userId } = window.Roblox?.CurrentUser ?? {};

const USER_TYPE_KEY = {
  friends: "Friends",
  followers: "Followers",
  requests: "Requests",
  followings: "Followings",
};

export const friendsDict = type => `Roblox.${USER_TYPE_KEY[type]}Dict.UserId${userId ?? 0}`;
