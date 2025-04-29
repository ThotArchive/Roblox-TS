const { LocalStorage } = window.Roblox;

class LocalStorageService {
  // TODO: old, migrated code
  // eslint-disable-next-line class-methods-use-this
  getUserKey(userId) {
    return `user_${userId}`;
  }

  // TODO: old, migrated code
  // eslint-disable-next-line class-methods-use-this
  storage() {
    if (LocalStorage) {
      return LocalStorage.isAvailable();
    }
    return localStorage;
  }

  getLength() {
    if (this.storage()) {
      return localStorage.length;
    }
    return 0;
  }

  getKey(i) {
    if (this.storage()) {
      return localStorage.key(i);
    }
    return "";
  }

  setLocalStorage(key, value) {
    if (this.storage()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getLocalStorage(key) {
    if (this.storage()) {
      return JSON.parse(localStorage.getItem(key));
    }
    return undefined;
  }

  listenLocalStorage(handlerCallback) {
    if (this.storage() && typeof handlerCallback !== "undefined") {
      if (window.addEventListener) {
        // Normal browsers
        window.addEventListener("storage", handlerCallback, false);
      } else {
        // for IE (why make your life more difficult)
        window.attachEvent("onstorage", handlerCallback);
      }
    }
  }

  removeLocalStorage(key) {
    if (this.storage()) {
      localStorage.removeItem(key);
    }
  }

  saveDataByTimeStamp(key, data) {
    const currentTime = new Date().getTime();
    const existingData = this.getLocalStorage(key) ?? {};
    existingData.data = data;
    existingData.timeStamp = currentTime;
    this.setLocalStorage(key, existingData);
  }

  fetchNonExpiredCachedData(key, expirationMS) {
    const currentTimeStamp = new Date().getTime();
    const cachedData = this.getLocalStorage(key);
    if (cachedData && cachedData.timeStamp) {
      const cachedTimeStamp = cachedData.timeStamp;
      const expiration = expirationMS || 30000; // default is 30s
      if (currentTimeStamp - cachedTimeStamp < expiration) {
        return cachedData;
      }
      // if cache is expired, remove it from localstorage
      this.removeLocalStorage(key);
    }
    return null;
  }
}

export default new LocalStorageService();
