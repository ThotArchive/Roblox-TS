import chatModule from '../chatModule';

function chatClientStorageUtilityService(chatUtility, localStorageService, cookieService) {
  'ngInject';

  return {
    storageDictionary: {
      dialogIdList: 'dialogIdList',
      dialogDict: 'dialogDict',
      dialogsLayout: 'dialogsLayout',
      chatBarLayout: 'chatBarLayout',
      chatFriendsListReloadTime: 'chatFriendsListReloadTime'
    },

    isStorageDefined(key) {
      if (typeof window.Storage !== 'undefined') {
        return this.getFromStorage(key);
      } else {
        return cookieService.isCookieDefined(key);
      }
    },

    getFromStorage(key) {
      if (typeof window.Storage !== 'undefined') {
        return localStorageService.getLocalStorage(key);
      } else {
        return cookieService.retrieveCookie(key);
      }
    },

    updateStorage(key, value, options) {
      if (typeof window.Storage !== 'undefined') {
        localStorageService.setLocalStorage(key, value);
      } else {
        cookieService.updateCookie(key, value, options);
      }
    },

    removeFromStorage(key, options) {
      if (typeof window.Storage !== 'undefined') {
        localStorageService.removeLocalStorage(key);
      } else {
        cookieService.destroyCookie(key, options);
      }
    },

    updateChatFriendsListReloadTime(reloadTime) {
      this.updateStorage(this.storageDictionary.chatFriendsListReloadTime, reloadTime);
    }
  };
}

chatModule.factory('chatClientStorageUtilityService', chatClientStorageUtilityService);

export default chatClientStorageUtilityService;
