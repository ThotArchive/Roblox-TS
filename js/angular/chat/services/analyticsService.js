import chatModule from '../chatModule';
import { EventStream } from 'Roblox';

function analyticsService($log, chatUtility) {
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
    }
  };
}

chatModule.factory('analyticsService', analyticsService);

export default analyticsService;
