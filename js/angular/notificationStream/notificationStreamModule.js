import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const notificationStream = angular
  .module('notificationStream', [
    'robloxApp',
    'ui.bootstrap',
    'notificationStreamHtmlTemplate',
    'thumbnails'
  ])
  .config([
    'languageResourceProvider',
    function (languageResourceProvider) {
      const translationProvider = new TranslationResourceProvider();
      const notificationsNotificationStreamResources = translationProvider.getTranslationResource('Notifications.NotificationStream');
      languageResourceProvider.setTranslationResources([notificationsNotificationStreamResources]);
    }
  ]);

export default notificationStream;
