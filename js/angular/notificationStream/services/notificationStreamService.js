import { EnvironmentUrls } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

function notificationStreamService(httpService, $log, urlService) {
  'ngInject';

  const { notificationApi, friendsApi } = EnvironmentUrls;
  const initializeUrl = `${notificationApi}/v2/stream-notifications/metadata`;

  return {
    endpoints: {
      initializeData: { url: initializeUrl, retryable: true },
      unreadCount: {
        url: `${notificationApi}/v2/stream-notifications/unread-count`,
        retryable: true,
        withCredentials: true
      },
      getRecent: {
        url: `${notificationApi}/v2/stream-notifications/get-recent`,
        retryable: true,
        withCredentials: true
      },
      clearUnread: {
        url: `${notificationApi}/v2/stream-notifications/clear-unread`,
        retryable: false,
        withCredentials: true
      },
      markInteracted: {
        url: `${notificationApi}/v2/stream-notifications/mark-interacted`,
        retryable: false,
        withCredentials: true
      },
      updateNotificationSettings: {
        url: `${notificationApi}/v2/notifications/update-notification-settings`,
        retryable: false,
        withCredentials: true
      },
      getAccountSettingsPolicy: {
        url: `${EnvironmentUrls.universalAppConfigurationApi}/v1/behaviors/account-settings-ui/content`,
        withCredentials: true,
        noCache: false
      }
    },

    initialize() {
      const params = {};
      return httpService.httpGet(this.endpoints.initializeData, params);
    },

    getAccountSettingsPolicy() {
      const params = {};
      return httpService.httpGet(this.endpoints.getAccountSettingsPolicy, params);
    },

    unreadCount() {
      const params = {};
      return httpService.httpGet(this.endpoints.unreadCount, params);
    },

    clearUnread() {
      const data = {};
      return httpService.httpPost(this.endpoints.clearUnread, data);
    },

    getRecentNotifications(startIndexOfNotifications, pageSizeOfNotifications) {
      const params = {
        startIndex: startIndexOfNotifications,
        maxRows: pageSizeOfNotifications
      };

      return httpService.httpGet(this.endpoints.getRecent, params);
    },

    markInteracted(eventId) {
      const data = {
        eventId
      };
      return httpService.httpPost(this.endpoints.markInteracted, data);
    },

    acceptFriendV2(targetUserId) {
      const urlConfig = {
        url: `${friendsApi}/v1/users/${targetUserId}/accept-friend-request`,
        withCredentials: true
      };

      return httpService.httpPost(urlConfig);
    },

    ignoreFriendV2(targetUserId) {
      const urlConfig = {
        url: `${friendsApi}/v1/users/${targetUserId}/decline-friend-request`,
        withCredentials: true
      };

      return httpService.httpPost(urlConfig);
    },

    updateNotificationSettings(notificationSourceType, isEnabled) {
      const data = {
        notificationSourceType,
        receiverDestinationType: 'NotificationStream',
        isEnabled
      };
      const list = [];
      list.push(data);
      return httpService.httpPost(this.endpoints.updateNotificationSettings, list);
    }
  };
}

notificationStreamModule.factory('notificationStreamService', notificationStreamService);

export default notificationStreamService;
