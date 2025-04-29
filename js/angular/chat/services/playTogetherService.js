import { CurrentUser } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function playTogetherService($log) {
  'ngInject';

  return {
    isPlacePlayersOnlyMe(conversation, rootPlaceId) {
      if (conversation.playTogetherDict && conversation.playTogetherDict[rootPlaceId]) {
        const { playerIds } = conversation.playTogetherDict[rootPlaceId];
        if (playerIds && playerIds.length === 1 && playerIds[0] === parseInt(CurrentUser.userId)) {
          // user will not see the self-play game
          return true;
        }
      }
      return false;
    },

    setPlaceForShown(conversation) {
      // set active game for shown first
      if (conversation.playTogetherIds && conversation.playTogetherIds.length > 0) {
        const latestSeenRootPlaceId = conversation.playTogetherIds[0];
        if (!this.isPlacePlayersOnlyMe(conversation, latestSeenRootPlaceId)) {
          const { universeId } = conversation.playTogetherDict[latestSeenRootPlaceId];
          conversation.placeForShown = {
            rootPlaceId: latestSeenRootPlaceId,
            universeId
          };
        }
      } else if (conversation.pinGame) {
        // then pinned game
        const { rootPlaceId, universeId } = conversation.pinGame;
        conversation.placeForShown = {
          rootPlaceId,
          universeId
        };
      } else {
        conversation.placeForShown = null;
      }
    },

    sortPlayTogetherIds(conversation, presenceData) {
      if (!conversation || !presenceData || !presenceData.rootPlaceId) {
        return false;
      }
      const rootPlaceId = parseInt(presenceData.rootPlaceId);
      const placeId = parseInt(presenceData.placeId);
      const gameInstanceId = presenceData.gameId;
      const playerId = parseInt(presenceData.userId);
      const universeId = parseInt(presenceData.universeId);
      let lastSeen = presenceData.lastOnline;
      if (lastSeen) {
        lastSeen = new Date(lastSeen).getTime();
      }
      if (!conversation.playTogetherIds) {
        conversation.playTogetherIds = [rootPlaceId];
        conversation.playTogetherDict = {};
        const gameInstancesDict = {};
        gameInstancesDict[gameInstanceId] = {
          lastSeen
        };
        conversation.playTogetherDict[rootPlaceId] = {
          playerIds: [playerId],
          gameInstanceId,
          lastSeen,
          placeId,
          universeId
        };
        return false;
      }

      if (!conversation.playTogetherDict[rootPlaceId]) {
        conversation.playTogetherDict[rootPlaceId] = {
          playerIds: [playerId],
          gameInstanceId,
          lastSeen,
          placeId,
          universeId
        };
      } else if (conversation.playTogetherDict[rootPlaceId].placeId !== placeId) {
        conversation.playTogetherDict[rootPlaceId].placeId = placeId;
      }

      // active game id by number of players
      if (conversation.playTogetherDict[rootPlaceId].playerIds.indexOf(playerId) < 0) {
        conversation.playTogetherDict[rootPlaceId].playerIds.push(playerId);
      }

      if (conversation.playTogetherDict[rootPlaceId]) {
        const numberOfPlayers = conversation.playTogetherDict[rootPlaceId].playerIds.length;
        angular.forEach(conversation.playTogetherIds, function(placeId, idx) {
          const existingPlayerIds = conversation.playTogetherDict[placeId].playerIds;
          if (existingPlayerIds.indexOf(playerId) > -1 && rootPlaceId !== placeId) {
            // means player also existed in other place, should remove
            const position = existingPlayerIds.indexOf(playerId);
            conversation.playTogetherDict[placeId].playerIds.splice(position, 1);
          }

          const count = conversation.playTogetherDict[placeId].playerIds.length;
          if (count < numberOfPlayers) {
            conversation.playTogetherIds.splice(idx, 0, rootPlaceId);
            return false;
          }
        });

        if (conversation.playTogetherIds.indexOf(rootPlaceId) < 0) {
          conversation.playTogetherIds.push(rootPlaceId);
        }
      }

      // if there is multiple game instances happening, sort by last seen
      const existingLastSeen = conversation.playTogetherDict[rootPlaceId].lastSeen;
      if (existingLastSeen < lastSeen) {
        // same game instance there, update last seen and compare other game instance last seen
        conversation.playTogetherDict[rootPlaceId].gameInstanceId = gameInstanceId;
        conversation.playTogetherDict[rootPlaceId].lastSeen = lastSeen;
      }
      conversation.recentPlaceIdFromPresence = presenceData.rootPlaceId;
      conversation.recentUserIdFromPresence = presenceData.userId;
    }
  };
}

chatModule.factory('playTogetherService', playTogetherService);

export default playTogetherService;
