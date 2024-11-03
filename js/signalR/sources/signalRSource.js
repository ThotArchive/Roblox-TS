import { CrossTabCommunication } from 'Roblox';
import * as signalR from '@microsoft/signalr';
import realtimeEvents from '../constants/events';
import signalRConnectionWrapper from '../lib/signalRConnectionWrapper';
import coreSignalRConnectionWrapper from '../lib/coreSignalRConnectionWrapper';
import events from '../utils/events';

const signalRSource = function (settings, logger) {
  const isAvailable = function () {
    return true;
  };

  const subscriptionStatusUpdateTypes = {
    connectionLost: 'ConnectionLost',
    reconnected: 'Reconnected',
    subscribed: 'Subscribed'
  };

  let onSourceExpiredHandler;
  let onNotificationHandler;
  let onConnectionEventHandler;

  // State
  let isCurrentlyConnected = false;
  let isReplicationEnabled = false;

  let signalRConnectionTimeout = null;
  let hasConnectionSucceeded = false;
  let waitForSubscriptionStatusTimeout = null;
  const waitForSubscriptionStatusTimeoutWait = 2000;

  let lastSequenceNumber = -1;
  let lastNamespaceSequenceNumberObj = {};

  let signalRConnection = null;

  let connectionId = '';

  const log = function (message, isVerbose) {
    if (logger) {
      logger(`SignalRSource: ${message}`, isVerbose);
    }
  };

  const setupReplication = function () {
    if (
      !CrossTabCommunication ||
      !CrossTabCommunication.Kingmaker ||
      !CrossTabCommunication.PubSub
    ) {
      log(
        'CrossTabCommunication dependencies required for replication are not present - will not replicate notifications'
      );
      isReplicationEnabled = false;
      return;
    }

    CrossTabCommunication.Kingmaker.SubscribeToMasterChange(function (isMasterTab) {
      isReplicationEnabled = isMasterTab;
      if (!isMasterTab) {
        onSourceExpiredHandler();
      }
    });
    isReplicationEnabled = CrossTabCommunication.Kingmaker.IsMasterTab();
    CrossTabCommunication.PubSub.Subscribe(
      realtimeEvents.RequestForConnectionStatus,
      'Roblox.RealTime.Sources.SignalRSource',
      function () {
        if (isReplicationEnabled) {
          const connectionEvent = {
            isConnected: isCurrentlyConnected,
            sequenceNumber: lastSequenceNumber,
            namespaceSequenceNumbersObj: lastNamespaceSequenceNumberObj
          };
          log(`Responding to request for connection status: ${JSON.stringify(connectionEvent)}`);
          CrossTabCommunication.PubSub.Publish(
            realtimeEvents.ConnectionEvent,
            JSON.stringify(connectionEvent)
          );
        }
      }
    );
  };

  const handleNotificationMessage = function (namespace, detail, sequenceNumber) {
    const parsedDetail = JSON.parse(detail);
    const namespaceSequenceNumber = parsedDetail.SequenceNumber || 0;
    const notification = {
      namespace,
      detail: parsedDetail,
      sequenceNumber,
      namespaceSequenceNumber
    };
    log(`Notification received: ${JSON.stringify(notification)}`, true);
    lastSequenceNumber = sequenceNumber || -1;
    lastNamespaceSequenceNumberObj[namespace] = namespaceSequenceNumber || -1;

    onNotificationHandler(notification);
    if (isReplicationEnabled) {
      log('Replicating Notification');
      CrossTabCommunication.PubSub.Publish(
        realtimeEvents.Notification,
        JSON.stringify(notification)
      );
    }
  };

  const processConnectionEvent = function (isConnected, subscriptionStatus) {
    isCurrentlyConnected = isConnected;

    const connectionEvent = {
      isConnected
    };

    const sequenceNumber = subscriptionStatus ? subscriptionStatus.SequenceNumber : null; // this is the default sequenceNumber
    let namespaceSequenceNumbersObj = subscriptionStatus
      ? subscriptionStatus.NamespaceSequenceNumbers
      : {};
    namespaceSequenceNumbersObj = namespaceSequenceNumbersObj || {};
    if (sequenceNumber !== null) {
      connectionEvent.sequenceNumber = sequenceNumber;
      lastSequenceNumber = sequenceNumber;
    } else {
      lastSequenceNumber = -1;
    }

    if (
      namespaceSequenceNumbersObj.constructor === Object &&
      Object.keys(namespaceSequenceNumbersObj).length > 0
    ) {
      connectionEvent.namespaceSequenceNumbersObj = namespaceSequenceNumbersObj;
      lastNamespaceSequenceNumberObj = namespaceSequenceNumbersObj;
    } else if (
      Object.keys(lastNamespaceSequenceNumberObj).length > 0 &&
      isConnected &&
      Object.keys(namespaceSequenceNumbersObj).length === 0
    ) {
      for (const namespace in lastNamespaceSequenceNumberObj) {
        if (Object.prototype.hasOwnProperty.call(lastNamespaceSequenceNumberObj, namespace)) {
          lastNamespaceSequenceNumberObj[namespace] = 0;
        }
      }
      connectionEvent.namespaceSequenceNumbersObj = lastNamespaceSequenceNumberObj;
    }

    log(`Sending Connection Event: ${JSON.stringify(connectionEvent)}`);
    onConnectionEventHandler(connectionEvent);
    if (isReplicationEnabled) {
      log('Replicating Connection Event.');
      CrossTabCommunication.PubSub.Publish(
        realtimeEvents.ConnectionEvent,
        JSON.stringify(connectionEvent)
      );
    }
  };

  const stopExistingSignalRTimeout = function () {
    $(window).unbind('focus.enforceMaxTimeout');
    if (signalRConnectionTimeout !== null) {
      clearTimeout(signalRConnectionTimeout);
      signalRConnectionTimeout = null;
    }
  };

  var setupSignalRTimeout = function () {
    stopExistingSignalRTimeout();
    signalRConnectionTimeout = setTimeout(function () {
      processConnectionEvent(false); // This is done before endConnection so that the replicator doesnt get nulled out. We want to replicate this message.
      signalRConnection.Stop();
      $(window)
        .unbind('focus.enforceMaxTimeout')
        .bind('focus.enforceMaxTimeout', function () {
          signalRConnection.Start();
          setupSignalRTimeout();
        });
    }, settings.maxConnectionTimeInMs);
  };

  const relayConnectionEventAfterWaitingRequestedTime = function (subscriptionStatus) {
    if (waitForSubscriptionStatusTimeout !== null) {
      clearTimeout(waitForSubscriptionStatusTimeout);
      waitForSubscriptionStatusTimeout = null;
    }

    if (subscriptionStatus.MillisecondsBeforeHandlingReconnect > 0) {
      log(
        `Waiting ${subscriptionStatus.MillisecondsBeforeHandlingReconnect}ms to send Reconnected signal`
      );

      setTimeout(function () {
        if (signalRConnection.IsConnected()) {
          processConnectionEvent(true, subscriptionStatus);
        }
      }, subscriptionStatus.MillisecondsBeforeHandlingReconnect);
    } else if (signalRConnection.IsConnected()) {
      processConnectionEvent(true, subscriptionStatus);
    }
  };

  const sendConnectionEventToDataLake = function (connectionState, subscriptionStatusUpdateType) {
    // subscriptionStatusUpdateType may be undefined, which is for a connection event

    // map connection states to expected values in proto schema
    // keep in sync with ConnectionState enum in realtime_clientside_connection_changes.proto
    // in proto-schemas
    const connectionStateMap = {
      [signalR.HubConnectionState.Connecting]: 0, // not used
      [signalR.HubConnectionState.Connected]: 1,
      [signalR.HubConnectionState.Reconnecting]: 2, // not used
      [signalR.HubConnectionState.Disconnected]: 3,
      NO_CONNECTION_UPDATE: 4
    };

    events.sendConnectionEventToDataLake(
      connectionStateMap[connectionState] ?? connectionStateMap.NO_CONNECTION_UPDATE,
      connectionId,
      subscriptionStatusUpdateType
    );
  };

  const setConnectionId = function (detailConnectionId) {
    if (detailConnectionId) {
      connectionId = detailConnectionId;
    }
  };

  const handleSubscriptionStatusUpdateMessage = function (updateType, detailString) {
    try {
      log(`Status Update Received: [${updateType}]${detailString}`);
    } catch (e) {}

    if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
      if (updateType === subscriptionStatusUpdateTypes.connectionLost) {
        // If the server loses its subscription to events, we will attempt
        // to restart the signalR connections and treat it like a standard
        // connection drop

        log('Server Backend Connection Lost!');
        signalRConnection.Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log('Server reconnected');
        const detail = JSON.parse(detailString);
        setConnectionId(detail.ConnectionId);
        relayConnectionEventAfterWaitingRequestedTime(detail);
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString);
        setConnectionId(detail.ConnectionId);
        log('Server connected');

        if (!hasConnectionSucceeded) {
          // if this client hasn't connected before, allow them to connect immediately
          hasConnectionSucceeded = true;
          detail.MillisecondsBeforeHandlingReconnect = 0;
        }

        relayConnectionEventAfterWaitingRequestedTime(detail);
      }

      sendConnectionEventToDataLake('NO_CONNECTION_UPDATE', updateType);
    } else {
      // disabling for flag logic
      // eslint-disable-next-line no-lonely-if
      if (updateType === subscriptionStatusUpdateTypes.connectionLost) {
        // If the server loses its subscription to events, we will attempt
        // to restart the signalR connections and treat it like a standard
        // connection drop

        log('Server Backend Connection Lost!');
        signalRConnection.Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log('Server reconnected');
        relayConnectionEventAfterWaitingRequestedTime(JSON.parse(detailString));
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString);
        log('Server connected');

        if (!hasConnectionSucceeded) {
          // if this client hasn't connected before, allow them to connect immediately
          hasConnectionSucceeded = true;
          detail.MillisecondsBeforeHandlingReconnect = 0;
        }

        relayConnectionEventAfterWaitingRequestedTime(detail);
      }
    }
  };

  const handleSignalRConnectionChanged = function (isConnected) {
    if (isConnected) {
      // wait till we receive a subscription status message, but if we don't receive it take action
      waitForSubscriptionStatusTimeout = setTimeout(function () {
        waitForSubscriptionStatusTimeout = null;
        if (signalRConnection.IsConnected()) {
          hasConnectionSucceeded = true;
          processConnectionEvent(true);
        }
      }, waitForSubscriptionStatusTimeoutWait);
    } else {
      processConnectionEvent(false);
    }
  };

  const start = function (onSourceExpired, onNotification, onConnectionEvent) {
    onSourceExpiredHandler = onSourceExpired;
    onNotificationHandler = onNotification;
    onConnectionEventHandler = onConnectionEvent;

    setupReplication();

    if (settings.notificationsClientType === 'CoreSignalR') {
      signalRConnection = new coreSignalRConnectionWrapper(
        settings,
        logger,
        handleSignalRConnectionChanged,
        handleNotificationMessage,
        handleSubscriptionStatusUpdateMessage,
        sendConnectionEventToDataLake
      );
      log('Started Core SignalR connection');
    } else {
      signalRConnection = new signalRConnectionWrapper(
        settings,
        logger,
        handleSignalRConnectionChanged,
        handleNotificationMessage,
        handleSubscriptionStatusUpdateMessage
      );
      log('Started Legacy SignalR connection');
    }

    signalRConnection.Start();
    setupSignalRTimeout();

    return true;
  };

  const stop = function () {
    stopExistingSignalRTimeout();
    if (signalRConnection) {
      signalRConnection.Stop();
    }
  };

  // Public API
  this.IsAvailable = isAvailable;
  this.Start = start;
  this.Stop = stop;
  this.Name = 'SignalRSource';
};

export default signalRSource;
