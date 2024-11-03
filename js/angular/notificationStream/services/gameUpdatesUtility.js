import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function gameUpdatesUtility(
  gameUpdatesService,
  urlService,
  $log,
  notificationStreamUtility,
  layoutLibraryService,
  gameUpdatesConstants
) {
  'ngInject';

  const { parseEpochMilliseconds } = notificationStreamUtility;
  const { gameNameMaxLength } = gameUpdatesConstants;

  function truncateGameName(gameName) {
    let truncated = gameName;

    if (gameName && gameName.length > gameNameMaxLength) {
      truncated = `${gameName.substr(0, gameNameMaxLength - 3)}...`;
    }

    return truncated;
  }

  function getGameUpdatesAsync(universeIds, gameUpdateModels, minEventDate) {
    const millisecondsInOneMinute = 60 * 1000;

    const promise = gameUpdatesService
      .multiGetGameUpdatesAsync(
        universeIds,
        minEventDate ? new Date(minEventDate.getTime() - millisecondsInOneMinute) : null
      )
      .then(function (gameUpdates) {
        let i;
        let gameUpdate;
        let model;
        let createdOnEpoch;

        if (!gameUpdates || gameUpdates.length === 0) {
          return null;
        }

        // Add to game update models.
        for (i = 0; i < gameUpdates.length; i++) {
          gameUpdate = gameUpdates[i];
          createdOnEpoch = parseEpochMilliseconds(gameUpdate.createdOn);

          if (!gameUpdateModels.hasOwnProperty(gameUpdate.universeId)) {
            gameUpdateModels[gameUpdate.universeId] = {
              universeId: gameUpdate.universeId,
              rootPlaceId: gameUpdate.rootPlaceId,
              updateMessage: gameUpdate.content,
              createdOn: createdOnEpoch,
              createdOnKey: gameUpdate.createdOnKey,
              gameName: gameUpdate.universeName,
              truncatedGameName: truncateGameName(gameUpdate.universeName),
              isPlayable: null,
              gameLinkUrl: gameUpdate.rootPlaceId
                ? urlService.getAbsoluteUrl(
                    `/games/${gameUpdate.rootPlaceId}?originatorType=GameUpdateNotification&originatorId=${createdOnEpoch}`
                  )
                : null,
              gameLinkUrlForApp: gameUpdate.rootPlaceId
                ? `games/${gameUpdate.rootPlaceId}?originatorType=GameUpdateNotification&originatorId=${createdOnEpoch}`
                : null
            };
          } else {
            model = gameUpdateModels[gameUpdate.universeId];
            model.updateMessage = gameUpdate.content;
            model.createdOn = createdOnEpoch;
            model.createdOnKey = gameUpdate.createdOnKey;
          }
        }

        return gameUpdates;
      });

    return promise;
  }

  // Fill in game details for models that still need them.
  function fillGameDetails(gameUpdateModels) {
    const newRootPlaceIds = [];
    let universeId;
    let model;

    for (universeId in gameUpdateModels) {
      if (!gameUpdateModels.hasOwnProperty(universeId)) {
        continue;
      }

      model = gameUpdateModels[universeId];

      if (model.isPlayable === null) {
        newRootPlaceIds.push(model.rootPlaceId);
      }
    }

    if (newRootPlaceIds.length === 0) {
      return;
    }

    // Start getting details for new games.
    gameUpdatesService.multiGetPlaceDetailsAsync(newRootPlaceIds).then(function (placeDetails) {
      if (!placeDetails) {
        return;
      }

      angular.forEach(placeDetails, function (placeDetail, placeId) {
        const model = gameUpdateModels[placeDetail.universeId];

        if (model) {
          model.isPlayable = placeDetail.isPlayable;
        }
      });

      return placeDetails;
    });
  }

  function aggregateGameUpdateNotifications(gameUpdateNotifications, gameUpdateModels) {
    if (!gameUpdateNotifications || gameUpdateNotifications.length === 0) {
      return null;
    }

    let maxEventTimeStamp = null;
    let minEventTimeStamp = null;
    let maxEventDate = null;
    let totalEventCount = 0;
    const processed = {};
    const aggregated = {};

    aggregated.id = gameUpdateNotifications[0].id;
    aggregated.notificationSourceType = gameUpdateNotifications[0].notificationSourceType;
    aggregated.metadataCollection = [];

    angular.forEach(gameUpdateNotifications, function (update) {
      let eventTimeStamp;

      // Find max event date.
      if (update.eventDate) {
        eventTimeStamp = parseEpochMilliseconds(update.eventDate);

        if (!maxEventTimeStamp || maxEventTimeStamp < eventTimeStamp) {
          maxEventTimeStamp = eventTimeStamp;
          maxEventDate = update.eventDate;
        }

        if (!minEventTimeStamp || minEventTimeStamp > eventTimeStamp) {
          minEventTimeStamp = eventTimeStamp;
        }
      }

      // Aggregate meta data collection.
      angular.forEach(update.metadataCollection, function (metaData) {
        if (
          gameUpdateModels.hasOwnProperty(metaData.UniverseId) &&
          !processed.hasOwnProperty(metaData.UniverseId)
        ) {
          aggregated.metadataCollection.push(metaData);
          processed[metaData.UniverseId] = true;
        }
      });

      // Aggregate event count.
      if (update.eventCount) {
        totalEventCount += update.eventCount;
      }
    });

    aggregated.eventDate = maxEventDate;
    aggregated.minEventDate = new Date(minEventTimeStamp);
    aggregated.eventCount = Math.max(totalEventCount, aggregated.metadataCollection.length);

    // Return null if there's no notification in the aggregated one.
    return aggregated.metadataCollection.length > 0 ? aggregated : null;
  }

  function formatAggregatedDisplayText(game1, game2, otherGameCount) {
    if (otherGameCount === 0) {
      return layoutLibraryService.gameUpdates.formatDisplayTextDouble(game1, game2);
    }

    return layoutLibraryService.gameUpdates.formatDisplayTextMultiple(game1, game2, otherGameCount);
  }

  function sortGameUpdatesByCreatedDate(gameUpdateModels, isAscending) {
    if (!gameUpdateModels) {
      return null;
    }

    const models = Object.keys(gameUpdateModels).map(function (k) {
      return gameUpdateModels[k];
    });

    models.sort(function (model1, model2) {
      return isAscending
        ? model1.createdOn - model2.createdOn
        : model2.createdOn - model1.createdOn;
    });

    return models;
  }

  return {
    formatAggregatedDisplayText,
    getGameUpdatesAsync,
    fillGameDetails,
    aggregateGameUpdateNotifications,
    sortGameUpdatesByCreatedDate
  };
}

notificationStreamModule.factory('gameUpdatesUtility', gameUpdatesUtility);

export default gameUpdatesUtility;
