import { EnvironmentUrls } from 'Roblox';

const {
  friendsApi,
  premiumFeaturesApi,
  usersApi,
  gamesApi,
  contactsApi,
  accountSettingsApi,
  authApi,
  tradesApi,
  apiGatewayUrl,
  chatApi
} = EnvironmentUrls;

export default {
  getProfileFriendsCount(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/friends/count`,
      withCredentials: true
    };
  },

  getProfileFollowingsCount(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/followings/count`,
      withCredentials: true
    };
  },

  getProfileFollowersCount(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/followers/count`,
      withCredentials: true
    };
  },

  validatePremumMembership(profileId) {
    return {
      url: `${premiumFeaturesApi}/v1/users/${profileId}/validate-membership`,
      withCredentials: true
    };
  },

  getUser(profileId) {
    return {
      url: `${usersApi}/v1/users/${profileId}`,
      withCredentials: true
    };
  },

  getFriendStatus(userId) {
    return {
      url: `${friendsApi}/v1/users/${userId}/friends/statuses`,
      withCredentials: true
    };
  },

  getChatMetadata() {
    return {
      url: `${chatApi}/v1/metadata`,
      withCredentials: true
    };
  },

  sendFriendRequest(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/request-friendship`,
      withCredentials: true
    };
  },

  acceptFriendRequest(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/accept-friend-request`,
      withCredentials: true
    };
  },

  removeFriend(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/unfriend`,
      withCredentials: true
    };
  },

  getUserTag() {
    return {
      url: `${contactsApi}/v1/user/get-tags`,
      withCredentials: true
    };
  },

  followingExists() {
    return {
      url: `${friendsApi}/v1/user/following-exists`,
      withCredentials: true
    };
  },

  setUserTag() {
    return {
      url: `${contactsApi}/v1/user/tag`,
      withCredentials: true
    };
  },

  followUser(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/follow`,
      withCredentials: true
    };
  },

  unFollowUser(profileId) {
    return {
      url: `${friendsApi}/v1/users/${profileId}/unfollow`,
      withCredentials: true
    };
  },

  favoriteGames(profileId) {
    return {
      url: `${gamesApi}/v2/users/${profileId}/games`,
      withCredentials: true
    };
  },

  blockUser(profileId) {
    return {
      url: `${accountSettingsApi}/v1/users/${profileId}/block`,
      withCredentials: true
    };
  },

  unblockUser(profileId) {
    return {
      url: `${accountSettingsApi}/v1/users/${profileId}/unblock`,
      withCredentials: true
    };
  },

  blockUserV2(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/block-user`,
      withCredentials: true
    };
  },

  unblockUserV2(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/unblock-user`,
      withCredentials: true
    };
  },

  getBlockedUsers() {
    return {
      url: `${accountSettingsApi}/v1/users/get-detailed-blocked-users`,
      withCredentials: true
    };
  },

  isBlockedUser(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/is-blocked`,
      withCredentials: true
    };
  },

  batchCheckReciprocalBlock() {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/batch-check-reciprocal-block`,
      withCredentials: true
    };
  },

  impersonateUser(profileId) {
    return {
      url: `${authApi}/v2/users/${profileId}/impersonate`,
      withCredentials: true
    };
  },

  canTradeWith(profileId) {
    return {
      url: `${tradesApi}/v1/users/${profileId}/can-trade-with`,
      withCredentials: true
    };
  },

  webProfileUIPolicy() {
    return {
      url: `${apiGatewayUrl}/universal-app-configuration/v1/behaviors/web-profile-ui/content`,
      withCredentials: true
    };
  }
};
