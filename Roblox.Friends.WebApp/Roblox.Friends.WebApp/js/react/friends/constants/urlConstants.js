import { EnvironmentUrls } from 'Roblox';

const {
  apiGatewayUrl,
  friendsApi,
  thumbnailsApi,
  presenceApi,
  gamesApi,
  usersApi
} = EnvironmentUrls;

export default {
  findFriendsConfig: (requesterUserId, cursor, isMyProfile, queryChanged) => {
    const userSort = isMyProfile ? '1' : '';
    const limit = queryChanged ? 36 : 18;
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${requesterUserId}/friends/find?limit=${limit}&cursor=${cursor}&userSort=${userSort}`
    };
  },
  searchFriendsConfig: (requesterUserId, cursor, query, queryChanged) => {
    const limit = queryChanged ? 36 : 18;
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${requesterUserId}/friends/search?limit=${limit}&cursor=${cursor}&query=${query}`
    };
  },
  getFriendsCountConfig: requesterUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${requesterUserId}/friends/count`
    };
  },
  acceptFriendUrlConfig: requesterUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${requesterUserId}/accept-friend-request`
    };
  },

  clearNewFriendRequestsUrlConfig: () => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/my/new-friend-requests`
    };
  },

  declineFriendUrlConfig: requesterUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${requesterUserId}/decline-friend-request`
    };
  },

  declineAllFriendsUrlConfig: () => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/user/friend-requests/decline-all`
    };
  },

  followFriendUrlConfig: targetUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${targetUserId}/follow`
    };
  },

  unfollowFriendUrlConfig: targetUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${targetUserId}/unfollow`
    };
  },

  unfriendUrlConfig: targetUserId => {
    return {
      retryable: false,
      withCredentials: true,
      url: `${friendsApi}/v1/users/${targetUserId}/unfriend`
    };
  },

  gamePlayabilityConfig: () => {
    return {
      retryable: true,
      withCredentials: true,
      url: `${gamesApi}/v1/games/multiget-playability-status`
    };
  },
  getDetailedUserInfoConfig: targetUserId => {
    return {
      retryable: true,
      withCredentials: true,
      url: `${usersApi}/v1/users/${targetUserId}`
    };
  },
  getFriendsRequestCountUrl: () => {
    return `${friendsApi}/v1/user/friend-requests/count`;
  },

  getFollowingsCountUrl: targetUserId => {
    return `${friendsApi}/v1/users/${targetUserId}/followings/count`;
  },

  getFollowersCountUrl: targetUserId => {
    return `${friendsApi}/v1/users/${targetUserId}/followers/count`;
  },

  getAvatarHeadshotsUrl: () => {
    return `${thumbnailsApi}/v1/users/avatar-headshot?size=150x150&format=png`;
  },

  getMetadataUrl: () => {
    return `${friendsApi}/v1/metadata`;
  },

  getUserProfileUrl: userId => {
    return `/users/${userId}/profile`;
  },

  getGamesUrl: () => {
    return `${gamesApi}/v1/games`;
  },

  getAmpUpsellWithParametersUrlConfig: (featureName, extraParameters = null, recourses = null) => ({
    retryable: true,
    withCredentials: true,
    url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}${
      extraParameters ? `&extraParameters=${extraParameters}` : ``
    }${recourses ? `&successfulActions=${recourses}` : ``}`
  })
};
