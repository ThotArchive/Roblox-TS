export const localStorageKey = "RobloxLocaleCode";

export const isLocalStorageAvailable = () => {
  const { LocalStorage } = window.Roblox;

  // localStorage is undefined when intl.js is loaded before the dom (i.e., for service worker)
  if (typeof localStorage !== "undefined") {
    return LocalStorage
      ? LocalStorage.isAvailable()
      : localStorage && localStorage.getItem && localStorage.setItem;
  }

  return false;
};
