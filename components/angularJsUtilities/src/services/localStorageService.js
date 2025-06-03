import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function localStorageService($log) {
  "ngInject";
  function handler(e) {
    $log.debug("Successfully communicate with other tab");
    $log.debug("Received data: " + localStorage.getItem("data"));
  }

  return {
    getUserKey: function (userId) {
      return "user_" + userId;
    },

    storage: function () {
      if (Roblox && Roblox.LocalStorage) {
        return Roblox.LocalStorage.isAvailable();
      }
      return localStorage;
    },

    getLength: function () {
      if (this.storage()) {
        return localStorage.length;
      }
      return 0;
    },

    getKey: function (i) {
      if (this.storage()) {
        return localStorage.key(i);
      }
      return "";
    },

    setLocalStorage: function (key, value) {
      if (this.storage()) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },

    getLocalStorage: function (key) {
      if (this.storage()) {
        return JSON.parse(localStorage.getItem(key));
      }
    },

    listenLocalStorage: function (handlerCallback) {
      if (this.storage() && angular.isDefined(handlerCallback)) {
        if (window.addEventListener) {
          // Normal browsers
          window.addEventListener("storage", handlerCallback, false);
        } else {
          // for IE (why make your life more difficult)
          window.attachEvent("onstorage", handlerCallback);
        }
      }
    },

    removeLocalStorage: function (key) {
      if (this.storage()) {
        localStorage.removeItem(key);
      }
    },

    saveDataByTimeStamp: function (key, data) {
      var currentTime = new Date().getTime();
      var existedData = this.getLocalStorage(key);
      if (!existedData) {
        existedData = {};
      }
      existedData["data"] = data;
      existedData["timeStamp"] = currentTime;
      this.setLocalStorage(key, existedData);
    },

    fetchNonExpiredCachedData: function (key, expirationMS) {
      var currentTimeStamp = new Date().getTime();
      var cachedData = this.getLocalStorage(key);
      if (cachedData && cachedData["timeStamp"]) {
        var cachedTimeStamp = cachedData["timeStamp"];
        expirationMS = expirationMS || 30000; // default is 30s
        if (currentTimeStamp - cachedTimeStamp < expirationMS) {
          return cachedData;
        }
      }
      return null;
    },
  };
}
angularJsUtilitiesModule.factory("localStorageService", localStorageService);

export default localStorageService;
