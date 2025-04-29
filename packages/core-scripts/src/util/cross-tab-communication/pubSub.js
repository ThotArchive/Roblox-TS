import $ from "jquery";

// Do not import anything here without considering if you need to update the rspack.config.js

const isLocalStorageEnabled = () => {
  const key = "roblox";
  try {
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
};

export const isAvailable = () => isLocalStorageEnabled();

const buildWindowEventName = (eventName, subscriberNamespace) =>
  `storage.${eventName}_${subscriberNamespace}`;

export const subscribe = (eventName, subscriberNamespace, callback) => {
  const windowEventName = buildWindowEventName(eventName, subscriberNamespace);
  $(window)
    .unbind(windowEventName)
    .bind(windowEventName, event => {
      if (event.originalEvent.key === eventName) {
        callback(event.originalEvent.newValue);
      }
    });
};

export const unsubscribe = (eventName, subscriberNamespace) => {
  const windowEventName = buildWindowEventName(eventName, subscriberNamespace);
  $(window).unbind(windowEventName);
};

export const publish = (eventName, message) => {
  localStorage.removeItem(eventName); // For some weird reason, the events are raised only if we delete and set the key again.
  localStorage.setItem(eventName, message);
};
