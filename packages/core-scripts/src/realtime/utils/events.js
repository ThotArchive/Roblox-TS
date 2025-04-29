const { EventStream } = window.Roblox ?? {};

export const maybeSendEventToDataLake = (namespaceId, details, payloadSize) => {
  if (!EventStream) {
    return;
  }

  const isDetailsArray = Array.isArray(details);
  const primaryDetail = isDetailsArray ? details[0] : details;
  const {
    SequenceNumber: sequenceNumber,
    ShouldSendToEventStream: shouldSendToEventStream,
    RealtimeMessageIdentifier: messageIdentifier,
  } = primaryDetail;
  if (!shouldSendToEventStream) {
    return;
  }

  EventStream.SendEventWithTarget(
    "RealtimeHandleEvent",
    "RealtimeHandleEventContext", // Context; not currently used
    {
      localTimestampMilliseconds: Date.now(),
      namespaceId,
      sequenceNumber: parseInt(sequenceNumber, 10),
      payloadSize,
      bulkMessageCount: isDetailsArray ? details.length : 1,
      messageIdentifier,
    },
    EventStream.TargetTypes.WWW,
  );
};

export const sendConnectionEventToDataLake = (
  connectionState,
  connectionId,
  subscriptionStatus,
) => {
  if (!EventStream) {
    return;
  }

  EventStream.SendEventWithTarget(
    "RealtimeWebConnectionChange",
    "RealtimeWebConnectionChangeContext", // Context; not currently used
    {
      localTimestampMilliseconds: Date.now(),
      connectionState,
      connectionId,
      subscriptionStatus,
    },
    EventStream.TargetTypes.WWW,
  );
};
