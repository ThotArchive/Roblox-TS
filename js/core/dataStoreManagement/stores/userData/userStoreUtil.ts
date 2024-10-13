import {
  getFriendsApiUrl,
  getFriendsRequestUrl,
  getUserPresenceUrl,
  UserDataRequest,
  PresenceObject,
  FriendObject,
  FriendsData,
  MethodType,
  UserPresence
} from './userDataConstants';

export const populateFriendsData = (friends: Array<FriendObject>) => {
  const friendsData: FriendsData = {};
  friends.forEach(friend => {
    friendsData[friend.id] = friend;
    friendsData[friend.id].profileUrl = `/users/${friend.id}/profile`;
    friendsData[friend.id].presence = {};
  });
  return friendsData;
};

export const populatePresenceData = (friendsData: FriendsData, presenceData: PresenceObject) => {
  if (presenceData?.data?.userPresences?.length > 0) {
    const {
      data: { userPresences }
    } = presenceData;

    const presences = [...userPresences];
    presences.forEach((userPresence: UserPresence) => {
      friendsData[userPresence.userId].presence = userPresence;
    });
  }
  return friendsData;
};

export const getFriendsUrlConfig = (methodName: MethodType, userId: number) => {
  let url = getFriendsApiUrl(userId, methodName);
  if (methodName === MethodType.Requests) {
    url = getFriendsRequestUrl();
  }
  return {
    url,
    retryable: true,
    withCredentials: true
  };
};

export const getFriendsParams = ({
  cursor,
  sortOrder,
  userSort,
  limit,
  fetchMutualFriends
}: UserDataRequest) => {
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

export const getPresenceUrlConfig = () => {
  return {
    url: getUserPresenceUrl(),
    retryable: false,
    withCredentials: true
  };
};
