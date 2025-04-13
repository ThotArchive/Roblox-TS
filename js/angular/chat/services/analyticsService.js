import chatModule from '../chatModule';
import { CurrentUser, EventStream } from 'Roblox';

function analyticsService($log, chatUtility, featureInterventionAnalytics) {
  'ngInject';

  const EventTracker = window.EventTracker;

  return {
    sendEvent(eventName, eventProperties) {
      if (!EventStream) {
        return;
      }
      EventStream.SendEventWithTarget(
        eventName,
        'WebChatEventContext', // Context; not currently used
        eventProperties,
        EventStream.TargetTypes.WWW
      );
    },
    incrementCounter(counterName) {
      if (!EventTracker) {
        return;
      }
      EventTracker.fireEvent(counterName);
    },
    getConversationIdForAnalytics(conversation) {
      if (conversation?.dialogType === chatUtility.dialogType.FRIEND) {
        // keep sync with getFriendId in lua-apps channels conversation model
        const conversationId = conversation.id || 'unknown-id';
        return `friends:${conversationId}`;
      }

      return conversation?.id;
    },
    sendInterventionEvent({ eventType, interventionType, renderedTimestamp, eventId, durationSeconds }) {
      if (!EventStream) {
        return;
      }
      const userId = parseInt(CurrentUser.userId);
      const interactedTimestamp = Date.now();

      const eventProperties = {
        user_id: userId,
        timestamp_milliseconds: interactedTimestamp,
        event_type: eventType,
        interventionType: interventionType,
        event_id: eventId,
        timeout_duration_seconds: durationSeconds,
        placement: 'Web'
      };
      if (
        eventType === featureInterventionAnalytics.eventTypes.appealClicked ||
        eventType === featureInterventionAnalytics.eventTypes.ctaClicked ||
        eventType === featureInterventionAnalytics.eventTypes.learnClicked
      ) {
        eventProperties.time_to_interact_seconds = (interactedTimestamp - renderedTimestamp) / 1000;
      }

      EventStream.SendEventWithTarget(
        featureInterventionAnalytics.eventName,
        featureInterventionAnalytics.eventContext,
        eventProperties,
        EventStream.TargetTypes.WWW
      );
    }
  };
}

chatModule.factory('analyticsService', analyticsService);

export default analyticsService;
