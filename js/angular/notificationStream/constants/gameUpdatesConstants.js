import { EnvironmentUrls } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

const gameUpdatesConstants = {
  endpoints: {
    getReadEndpoint() {
      return {
        url: `${EnvironmentUrls.notificationApi}/v2/stream-notifications/game-update-notification-read`,
        retryable: false,
        withCredentials: true
      };
    },

    getGameFollowingsEndpoint(userId) {
      return {
        url: `${EnvironmentUrls.followingsApi}/v1/users/${userId}/universes`,
        retryable: true,
        withCredentials: true
      };
    },

    getFollowGameEndpoint(userId, universeId) {
      return {
        url: `${EnvironmentUrls.followingsApi}/v1/users/${userId}/universes/${universeId}`,
        retryable: false,
        withCredentials: true
      };
    },

    getGameDetailsEndpoint() {
      return {
        url: `${EnvironmentUrls.gamesApi}/v1/games/multiget-place-details`,
        retryable: true,
        withCredentials: true
      };
    },

    getGameUpdatesEndpoint() {
      return {
        url: `${EnvironmentUrls.notificationApi}/v2/stream-notifications/get-latest-game-updates`,
        retryable: true,
        withCredentials: true
      };
    },

    getAbuseReportUrl(universeId, gameUpdateCreatedOn, redirectUrl) {
      // Parameter gameUpdateCreatedOn is unused at this point, as moderation
      // can only take universe ID as the utterance source ID.
      return `${EnvironmentUrls.websiteUrl}/abusereport/gameupdate?id=${universeId}&redirectUrl=${redirectUrl}`;
    }
  },

  apiParams: {
    gameUpdateBatchSize: 100,
    placeDetailBatchSize: 100
  },

  gameNameMaxLength: 30,
  gameUpdateInteractions: {
    played: 'Played',
    seen: 'Seen',
    unfollowed: 'Unfollowed'
  }
};

notificationStreamModule.constant('gameUpdatesConstants', gameUpdatesConstants);

export default gameUpdatesConstants;
