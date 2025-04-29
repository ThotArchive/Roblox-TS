import $ from "jquery";

// TODO: old, migrated code
// eslint-disable-next-line func-names
const signalRConnectionWrapper = function (
  settings,
  logger,
  onConnectionStatusChangedCallback,
  onNotificationCallback,
  onSubscriptionStatusCallback,
) {
  const self = this;

  // SignalR Constants
  const signalRStateConversion = {
    0: "connecting",
    1: "connected",
    2: "reconnecting",
    4: "disconnected",
  };
  const signalRState = { connecting: 0, connected: 1, reconnecting: 2, disconnected: 4 };

  let signalrConnection = null;
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

  const getAllowedTransports = () => {
    if (window.WebSocket) {
      return ["webSockets"];
    }
    return ["webSockets", "longPolling"];
  };

  const getConnectionOptions = () => {
    const connectionOptions = {
      pingInterval: null,
    };

    if (settings.isSignalRClientTransportRestrictionEnabled) {
      connectionOptions.transport = getAllowedTransports();
    }

    return connectionOptions;
  };

  const handleSignalRStateChange = state => {
    if (state.newState === signalRState.connected) {
      isConnected = true;
      onConnectionStatusChangedCallback(true);
    } else if (state.oldState === signalRState.connected && isConnected) {
      isConnected = false;
      onConnectionStatusChangedCallback(false);
    }

    log(
      `Connection Status changed from [${signalRStateConversion[state.oldState]}] to [${
        signalRStateConversion[state.newState]
      }]`,
    );
  };

  const handleSignalRDisconnected = () => {
    // after connection failure attempt automatic reconnect after a suitable delay
    const delay = exponentialBackoff.StartNewAttempt();
    log(`In disconnected handler. Will attempt Reconnect after ${delay}ms`);

    setTimeout(() => {
      const attemptCount = exponentialBackoff.GetAttemptCount();
      if (attemptCount === 1) {
        const { CurrentUser } = window.Roblox;
        const userId = `userId: ${CurrentUser}` && CurrentUser.userId;
        if (typeof GoogleAnalyticsEvents !== "undefined") {
          // TODO: old, migrated code
          // eslint-disable-next-line no-undef
          GoogleAnalyticsEvents.FireEvent(["SignalR", "Attempting to Reconnect", userId]);
        }
      }
      log(`Attempting to Reconnect [${exponentialBackoff.GetAttemptCount()}]...`);
      if (signalrConnection == null) {
        return;
      }
      signalrConnection
        .start(getConnectionOptions())
        .done(() => {
          exponentialBackoff.Reset();
          log("Connected Again!");
        })
        .fail(() => {
          log("Failed to Reconnect!");
        });
    }, delay);
  };

  const handleSignalRReconnecting = () => {
    log("In reconnecting handler. Attempt to force disconnect.");
    signalrConnection.stop(); // To trigger backed-off reconnect logic
  };

  const setupSignalRConnection = () => {
    const notificationsBaseUrl = settings.notificationsUrl;

    const connection = $.hubConnection(`${notificationsBaseUrl}/notifications`, {
      useDefaultPath: false,
    });
    const userNotificationsHub = connection.createHubProxy("userNotificationHub");

    // Subscribe to events raised by the server(magikx)
    userNotificationsHub.on("notification", onNotificationCallback);
    userNotificationsHub.on("subscriptionStatus", onSubscriptionStatusCallback);

    // Wire up signalR connection state change events
    connection.stateChanged(handleSignalRStateChange);
    connection.disconnected(handleSignalRDisconnected);
    connection.reconnecting(handleSignalRReconnecting);

    return connection;
  };

  const start = () => {
    signalrConnection = setupSignalRConnection();
    signalrConnection
      .start(getConnectionOptions())
      .done(() => {
        log(`Connected to SignalR [${signalrConnection.transport.name}]`);
      })
      .fail(args => {
        log(`FAILED to connect to SignalR [${args}]`);
      });
  };

  const stop = () => {
    if (signalrConnection) {
      $(signalrConnection).unbind(); // unbind all events to stop onDisconnected from triggering
      signalrConnection.stop();
      signalrConnection = null;
    }
    onConnectionStatusChangedCallback(false);
  };

  const restart = () => {
    if (signalrConnection === null) {
      start();
    } else {
      signalrConnection.stop();
      // this will trigger an automatic restart
    }
  };

  const getIsConnected = () => isConnected;

  // Interface
  self.Start = start;
  self.Stop = stop;
  self.Restart = restart;
  self.IsConnected = getIsConnected;
};

export default signalRConnectionWrapper;
