import { pubSub, kingmaker } from "@rbx/core-scripts/util/cross-tab-communication";
import { realtimeEvents } from "../constants/events";

// TODO: old, migrated code
// eslint-disable-next-line func-names
const crossTabReplicatedSource = function (settings, logger) {
  const subscriberNamespace = "Roblox.RealTime.Sources.CrossTabReplicatedSource";
  let isRunning = false;

  let onSourceExpiredHandler;
  let onNotificationHandler;
  let onConnectionEventHandler;

  const log = (message, isVerbose) => {
    if (logger) {
      logger(`CrossTabReplicatedSource: ${message}`, isVerbose);
    }
  };

  const available = () => {
    if (!pubSub.isAvailable()) {
      log("CrossTabCommunication.Kingmaker not available - cannot pick a master tab");
      return false;
    }
    if (kingmaker.isMasterTab()) {
      log("This is the master tab - it needs to send the events, not listen to them");
      return false;
    }
    return true;
  };

  const subscribeToEvents = () => {
    kingmaker.subscribeToMasterChange(isMasterTab => {
      if (isMasterTab && isRunning && onSourceExpiredHandler) {
        log("Tab has been promoted to master tab - triggering end of this source");
        onSourceExpiredHandler();
      }
    });
    pubSub.subscribe(realtimeEvents.Notification, subscriberNamespace, notification => {
      log(`Notification Received: ${notification}`, true);
      if (notification) {
        onNotificationHandler(JSON.parse(notification));
      }
    });
    pubSub.subscribe(realtimeEvents.ConnectionEvent, subscriberNamespace, event => {
      log(`Connection Event Received: ${event}`);
      if (event) {
        onConnectionEventHandler(JSON.parse(event));
      }
    });
  };

  const requestConnectionStatus = () => {
    pubSub.publish(
      realtimeEvents.RequestForConnectionStatus,
      realtimeEvents.RequestForConnectionStatus,
    );
  };

  const stop = () => {
    log("Stopping. Unsubscribing from Cross-Tab events");
    isRunning = false;
    pubSub.unsubscribe(realtimeEvents.Notification, subscriberNamespace);
    pubSub.unsubscribe(realtimeEvents.ConnectionEvent, subscriberNamespace);
  };

  const start = (onSourceExpired, onNotification, onConnectionEvent) => {
    if (!available()) {
      return false;
    }
    isRunning = true;

    onSourceExpiredHandler = onSourceExpired;
    onNotificationHandler = onNotification;
    onConnectionEventHandler = onConnectionEvent;

    subscribeToEvents();
    requestConnectionStatus();

    return true;
  };

  // Public API
  this.IsAvailable = available;
  this.Start = start;
  this.Stop = stop;
  this.Name = "CrossTabReplicatedSource";
};

export default crossTabReplicatedSource;
