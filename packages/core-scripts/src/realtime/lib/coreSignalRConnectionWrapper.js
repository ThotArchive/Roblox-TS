import * as signalR from "@microsoft/signalr";

// TODO: old, migrated code
// eslint-disable-next-line func-names
const coreSignalRConnectionWrapper = function (
  settings,
  logger,
  onConnectionStatusChangedCallback,
  onNotificationCallback,
  onSubscriptionStatusCallback,
  connectionEventCallback,
) {
  const self = this;

  // Initialize values
  let userNotificationConnection = null;
  let isConnected = false;

  const getExponentialBackoff = () => {
    const { Utilities } = window.Roblox;
    if (!Utilities) {
      return false;
    }
    // Exponential Backoff Configuration
    const regularBackoffSpec = new Utilities.ExponentialBackoffSpecification({
      firstAttemptDelay: 2000,
      firstAttemptRandomnessFactor: 3,
      subsequentDelayBase: 10000,
      subsequentDelayRandomnessFactor: 0.5,
      maximumDelayBase: 300000,
    });
    const fastBackoffSpec = new Utilities.ExponentialBackoffSpecification({
      firstAttemptDelay: 20000,
      firstAttemptRandomnessFactor: 0.5,
      subsequentDelayBase: 40000,
      subsequentDelayRandomnessFactor: 0.5,
      maximumDelayBase: 300000,
    });
    const fastBackoffThreshold = 60000; // maximum time between reconnects to trigger fast backoff mode

    const fastBackoffPredicate = exponentialBackoff => {
      const lastSuccessfulConnection = exponentialBackoff.GetLastResetTime();

      // If we are attempting to reconnect again shortly after having reconnected, it may indicate
      // server instability, in which case we should backoff more quickly
      if (
        lastSuccessfulConnection &&
        lastSuccessfulConnection + fastBackoffThreshold > new Date().getTime()
      ) {
        return true;
      }
      return false;
    };

    return new Utilities.ExponentialBackoff(
      regularBackoffSpec,
      fastBackoffPredicate,
      fastBackoffSpec,
    );
  };

  const exponentialBackoff = getExponentialBackoff();

  const log = msg => {
    if (logger) {
      logger(msg);
    }
  };

  const handleSignalRStateChange = connectionState => {
    if (connectionState === signalR.HubConnectionState.Connected) {
      // only emit event on connected, because disconnected event
      // is emitted in handleSignalRDisconnected
      if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
        connectionEventCallback(connectionState);
      }
      isConnected = true;
      onConnectionStatusChangedCallback(true);
    } else if (connectionState === signalR.HubConnection.Disconnected) {
      isConnected = false;
      onConnectionStatusChangedCallback(false);
    }
  };

  const handleSignalRDisconnected = connectionState => {
    if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
      connectionEventCallback(connectionState);
    }

    if (connectionState === signalR.HubConnectionState.Disconnected) {
      // after connection failure attempt automatic reconnect after a suitable delay
      const delay = exponentialBackoff.StartNewAttempt();
      log(`In Disconnection handler. Will attempt Reconnect after ${delay}ms`);

      setTimeout(() => {
        if (userNotificationConnection == null) {
          return;
        }
        userNotificationConnection
          .start()
          .then(() => {
            handleSignalRStateChange(userNotificationConnection.state);
          })
          .catch(err => {
            log("Connection after Disconnection unsuccessful. err:", err);
          });
      }, delay);
    }
  };

  const getNewSignalRConnection = () => {
    userNotificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(settings.notificationsUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .build();

    // Subscribe to the notification and subscriptionStatus methods which the server will call
    userNotificationConnection.on("notification", onNotificationCallback);
    userNotificationConnection.on("subscriptionStatus", onSubscriptionStatusCallback);

    // Connect to handleSignalRDisconnected when connection closes (disconnects)
    // Since our Core Signal R does not reconnect, we do not need a callback on reconnect
    userNotificationConnection.onclose(() => {
      handleSignalRDisconnected(userNotificationConnection.state);
    });

    return userNotificationConnection;
  };

  const start = () => {
    userNotificationConnection = getNewSignalRConnection();
    userNotificationConnection
      .start()
      .then(() => {
        handleSignalRStateChange(userNotificationConnection.state);
      })
      .catch(err => {
        log("FAILED to connect to Core SignalR", err);
      });
  };

  const stop = () => {
    if (userNotificationConnection) {
      userNotificationConnection.onclose(() => undefined); // Need to unbind the onclose callback, or else we will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
      userNotificationConnection.stop();
      userNotificationConnection = null;
    }
    onConnectionStatusChangedCallback(false);
  };

  const restart = () => {
    if (userNotificationConnection === null) {
      start();
    } else {
      userNotificationConnection.stop(); // We will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
    }
  };

  const getIsConnected = () => isConnected;

  // Interface
  self.Start = start;
  self.Stop = stop;
  self.Restart = restart;
  self.IsConnected = getIsConnected;
};

export default coreSignalRConnectionWrapper;
