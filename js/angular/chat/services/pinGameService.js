import chatModule from '../chatModule';

function pinGameService($log, playTogetherService, gameService, eventStreamService, resources) {
  'ngInject';

  return {
    sendPinGameEvent(eventType, rootPlaceId, conversation) {
      let properties = {
        placeId: rootPlaceId,
        conversationId: conversation.id
      };
      eventStreamService.sendEventWithTarget(
        eventType,
        resources.eventStreamParams.actions.click,
        properties
      );
    },

    setPinGameData(conversation, parameters) {
      if (parameters && parameters.universeId) {
        let {rootPlaceId} = parameters;
        conversation.pinGame = {
          universeId: parameters.universeId,
          rootPlaceId,
          placeName: parameters.placeName,
          encodedPlaceName: parameters.encodedPlaceName,
          actorUsername: parameters.actorUsername,
          userId: parameters.userId
        };
        playTogetherService.setPlaceForShown(conversation);
      } else {
        conversation.pinGame = null;
        playTogetherService.setPlaceForShown(conversation);
      }
    },

    pinGame(conversation, universeId) {
      if (conversation && universeId) {
        gameService.setConversationUniverse(conversation.id, universeId);
      }
    },

    unpinGame(conversation) {
      if (conversation) {
        gameService.resetConversationUniverse(conversation.id);
      }
    }
  };
}

chatModule.factory('pinGameService', pinGameService);

export default pinGameService;
