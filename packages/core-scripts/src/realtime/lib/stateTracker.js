import realtimeFactory from "./factory";

// TODO: old, migrated code
// eslint-disable-next-line func-names
const realtimeStateTracker = function (
  localStoragePersistenceEnabled,
  eventPublishingEnabled,
  loggingFunction,
) {
  const refreshRequiredEnum = {
    IS_REQUIRED: 1,
    NOT_REQUIRED: 2,
    UNCLEAR: 3,
  };

  const latestRealTimeInformationPrefix =
    "Roblox.RealTime.StateTracker.LastNamespaceSequenceNumberProcessed_U_";
  const eventStreamEvents = {
    RealTimeCheckIfDataReloadRequired: "realTimeCheckIfDataReloadRequired",
    RealTimeUpdateLatestSequenceNumber: "realTimeUpdateLatestSequenceNumber",
  };
  const eventStreamContexts = {
    OutOfOrder: "SequenceOutOfOrder",
    MissedNumber: "SequenceNumberMissed",
    UpToDate: "SequenceNumberMatched",
    TimeExpired: "TimeStampExpired",
    InvalidSequenceNumber: "InvalidSequenceNumber",
    MissingNotificationInfo: "MissingNotificationInformation",
  };

  let currentRecordedState = null;

  const log = content => {
    if (typeof loggingFunction === "function") {
      loggingFunction(content);
    }
  };

  const getRealTimeStateKey = () => {
    const key = latestRealTimeInformationPrefix + realtimeFactory.GetUserId();
    return key;
  };

  const safeParse = jsonString => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      log("Error parsing jsonString");
      return null;
    }
  };

  const init = () => {
    log("StateTracker Initialized");
    if (localStoragePersistenceEnabled) {
      const storedValue = localStorage.getItem(getRealTimeStateKey());
      if (storedValue) {
        currentRecordedState = safeParse(storedValue);
      }
    }
  };

  const updateCurrentState = (namespace, sequenceNumber) => {
    if (!currentRecordedState || !currentRecordedState.namespaceSequenceNumbersObj) {
      currentRecordedState = {
        namespaceSequenceNumbersObj: {},
      };
    }
    currentRecordedState.namespaceSequenceNumbersObj[namespace] = sequenceNumber;
    currentRecordedState.TimeStamp = Date.now();

    if (localStoragePersistenceEnabled) {
      localStorage.setItem(getRealTimeStateKey(), JSON.stringify(currentRecordedState));
    }
  };

  const pushToEventStream = (eventName, eventContext, properties) => {
    try {
      const { EventStream } = window.Roblox;
      if (eventPublishingEnabled && EventStream) {
        if (typeof properties !== "object") {
          // TODO: old, migrated code
          // eslint-disable-next-line no-param-reassign
          properties = {};
        }
        // TODO: old, migrated code
        // eslint-disable-next-line no-param-reassign
        properties.ua = navigator.userAgent;
        EventStream.SendEvent(eventName, eventContext, properties);
      }
    } catch (e) {
      log("Error pushing to Event Stream");
    }
  };

  const getLatestState = () => currentRecordedState;

  // returns RefreshRequiredEnum
  const isDataReloadRequired = (namespace, newlyReportedSequenceNumber) => {
    // If we are not receiving a valid sequence number, we should not take any action based on it
    // Do not want to risk triggering mass reconnects until we are convinced all platforms are
    // respecting and relaying sequence numbers correctly
    if (typeof newlyReportedSequenceNumber !== "number") {
      pushToEventStream(
        eventStreamEvents.RealTimeCheckIfDataReloadRequired,
        eventStreamContexts.InvalidSequenceNumber,
        { rld: true },
      );
      return refreshRequiredEnum.UNCLEAR;
    }

    const currentRecordedSequenceNumber = getLatestState();
    if (
      typeof currentRecordedSequenceNumber === "undefined" ||
      currentRecordedSequenceNumber == null
    ) {
      pushToEventStream(
        eventStreamEvents.RealTimeCheckIfDataReloadRequired,
        eventStreamContexts.MissingNotificationInfo,
        { rld: true },
      );
      updateCurrentState(namespace, newlyReportedSequenceNumber);

      return refreshRequiredEnum.UNCLEAR;
    }

    const currentSequenceNumber =
      currentRecordedSequenceNumber.namespaceSequenceNumbersObj[namespace];

    // when server side returns 0 as seq NO. and current local cached seq NO. is
    // not 0 means not the first time users, we need to gradually hard refresh
    // client side
    if (newlyReportedSequenceNumber === 0 && currentSequenceNumber !== 0) {
      updateCurrentState(namespace, newlyReportedSequenceNumber);
      pushToEventStream(
        eventStreamEvents.RealTimeCheckIfDataReloadRequired,
        eventStreamContexts.OutOfOrder,
        { rld: true },
      );

      return refreshRequiredEnum.IS_REQUIRED;
    }

    if (newlyReportedSequenceNumber < 0 && currentSequenceNumber >= 0) {
      return refreshRequiredEnum.UNCLEAR;
    }

    if (newlyReportedSequenceNumber === currentSequenceNumber) {
      updateCurrentState(namespace, newlyReportedSequenceNumber);
      pushToEventStream(
        eventStreamEvents.RealTimeCheckIfDataReloadRequired,
        eventStreamContexts.UpToDate,
        { rld: false },
      );
      return refreshRequiredEnum.NOT_REQUIRED;
    }
    pushToEventStream(
      eventStreamEvents.RealTimeCheckIfDataReloadRequired,
      eventStreamContexts.MissedNumber,
      { rld: true },
    );
    if (newlyReportedSequenceNumber > currentSequenceNumber) {
      updateCurrentState(namespace, newlyReportedSequenceNumber);
      pushToEventStream(
        eventStreamEvents.RealTimeCheckIfDataReloadRequired,
        eventStreamContexts.OutOfOrder,
        { rld: true },
      );
      return refreshRequiredEnum.IS_REQUIRED;
    }
    if (!currentSequenceNumber) {
      updateCurrentState(namespace, newlyReportedSequenceNumber);
    }
    return refreshRequiredEnum.UNCLEAR;
  };

  const updateSequenceNumber = (namespace, sequenceNumber) => {
    if (typeof sequenceNumber !== "number") {
      pushToEventStream(
        eventStreamEvents.RealTimeUpdateLatestSequenceNumber,
        eventStreamContexts.InvalidSequenceNumber,
      );
      return;
    }

    const latestNotificationInfo = getLatestState();

    if (
      typeof latestNotificationInfo === "object" &&
      latestNotificationInfo != null &&
      latestNotificationInfo.namespaceSequenceNumbersObj &&
      latestNotificationInfo.namespaceSequenceNumbersObj[namespace] > sequenceNumber
    ) {
      pushToEventStream(
        eventStreamEvents.RealTimeUpdateLatestSequenceNumber,
        eventStreamContexts.OutOfOrder,
      );
    }

    updateCurrentState(namespace, sequenceNumber);
  };

  init();

  this.IsDataRefreshRequired = isDataReloadRequired;
  this.UpdateSequenceNumber = updateSequenceNumber;
  this.GetLatestState = getLatestState;
  this.RefreshRequiredEnum = refreshRequiredEnum;
};

export default realtimeStateTracker;
