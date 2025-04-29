import angular from 'angular';
import chatModule from '../chatModule';

function storageService(resources, $log, localStorageService) {
  'ngInject';

  let isChatDataFromLocalStorageEnabled = false;
  let chatDataFromLocalStorageExpirationMS = 10000;

  return {
    chatDataName: {
      getUserConversations: 'getUserConversations',
      getConversations: 'getConversations',
      getMessages: 'getMessages'
    },

    setStorageParams(data) {
      isChatDataFromLocalStorageEnabled = data.IsChatDataFromLocalStorageEnabled;
      chatDataFromLocalStorageExpirationMS = data.ChatDataFromLocalStorageExpirationSeconds * 1000;
    },

    getStorageName(name, params) {
      var chatDataLSName = resources.chatDataLSNamePrefix + '.' + name;
      angular.forEach(params, function(param) {
        chatDataLSName = chatDataLSName + '.' + param;
      });
      return chatDataLSName;
    },

    saveChatDataToLocalStorage(name, data) {
      if (isChatDataFromLocalStorageEnabled) {
        localStorageService.saveDataByTimeStamp(name, data);
      }
    },

    getChatDataFromLocalStorage(name) {
      if (isChatDataFromLocalStorageEnabled) {
        localStorageService.fetchNonExpiredCachedData(name, chatDataFromLocalStorageExpirationMS);
      }
      return null;
    },

    clearLocalStorage() {
      let storageData = localStorageService.storage();
      if (storageData) {
        for (let key in storageData) {
          if (key && key.search(resources.chatDataLSNamePrefix) > -1) {
            localStorageService.removeLocalStorage(key);
          }
        }
      }
    }
  };
}

chatModule.factory('storageService', storageService);

export default storageService;
