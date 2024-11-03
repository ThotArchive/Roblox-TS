import { AbuseReportDispatcher } from 'Roblox';
import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function gameUpdatesService(httpService, $q, $log, urlService, gameUpdatesConstants, $window) {
  'ngInject';

  const { endpoints } = gameUpdatesConstants;
  const { apiParams } = gameUpdatesConstants;

  // Helper to invoke a multi-get endpoint with input batches of acceptable size.
  function batchMultiGet(endpoint, paramValues, batchSize, paramsBuilder) {
    const promises = [];
    let params;
    let batchStartIndex = 0;
    let batch;

    batch = paramValues.slice(batchStartIndex, batchSize);

    while (batch.length > 0 && batchStartIndex < paramValues.length) {
      params = paramsBuilder(batch);

      promises.push(httpService.httpGet(endpoint, params));

      batchStartIndex += batchSize;
      batch = paramValues.slice(batchStartIndex, batchStartIndex + batchSize);
    }

    return $q.all(promises);
  }

  // Helper to get game playability.
  function multiGetPlaceDetailsAsync(placeIds) {
    const endpoint = endpoints.getGameDetailsEndpoint();

    return batchMultiGet(endpoint, placeIds, apiParams.placeDetailBatchSize, function (batch) {
      return {
        placeIds: batch
      };
    }).then(function (results) {
      const placeDetails = {};
      const imageTokens = [];

      if (!results || results.length === 0) {
        return null;
      }

      angular.forEach(results, function (result) {
        if (!result) {
          return;
        }

        angular.forEach(result, function (item) {
          placeDetails[item.placeId] = {
            universeId: item.universeId,
            isPlayable: item.isPlayable,
            imageToken: item.imageToken
          };
        });
      });

      return placeDetails;
    });
  }

  // Helper to retrieve latest game updates.
  function multiGetGameUpdatesAsync(universeIds, sinceDateTime) {
    // sinceDateTime is not being used right now because the EventDate from notifications stream does not return the correct date for now.
    const endpoint = endpoints.getGameUpdatesEndpoint();

    return batchMultiGet(endpoint, universeIds, apiParams.gameUpdateBatchSize, function (batch) {
      return {
        universeIds: batch
      };
    }).then(function (results) {
      const gameUpdates = [];

      if (!results || results.length === 0) {
        return null;
      }

      angular.forEach(results, function (result) {
        if (!result) {
          return;
        }

        angular.forEach(result, function (item) {
          gameUpdates.push(item);
        });
      });

      return gameUpdates;
    });
  }

  return {
    markGameUpdateReadAsync(universeId, createdOn, currentUserId) {
      const endpoint = endpoints.getReadEndpoint();

      const params = {
        universeId,
        createdOn: createdOn.toString(),
        currentUserId
      };

      return httpService.httpPost(endpoint, params);
    },

    markGameUpdateInteractedAsync(universeId, createdOnKey, interactionType, currentUserId) {
      const endpoint = endpoints.getInteractedEndpoint();

      const params = {
        universeId,
        createdOnKey,
        interactionType,
        currentUserId
      };

      return httpService.httpPost(endpoint, params);
    },

    multiGetPlaceDetailsAsync(placeIds) {
      if (!placeIds || placeIds.length === 0) {
        return $q(function (resolve, reject) {
          resolve(null);
        });
      }

      return multiGetPlaceDetailsAsync(placeIds);
    },

    multiGetGameUpdatesAsync(universeIds, sinceDateTime) {
      if (!universeIds || universeIds.length === 0) {
        return $q(function (resolve, reject) {
          resolve(null);
        });
      }

      return multiGetGameUpdatesAsync(universeIds, sinceDateTime);
    },

    getGameFollowingsForUserAsync(userId) {
      const endpoint = endpoints.getGameFollowingsEndpoint(userId);
      return httpService.httpGet(endpoint, {});
    },

    followGameAsync(userId, universeId) {
      const endpoint = endpoints.getFollowGameEndpoint(userId, universeId);
      return httpService.httpPost(endpoint, {});
    },

    unfollowGameAsync(userId, universeId) {
      const endpoint = endpoints.getFollowGameEndpoint(userId, universeId);
      return httpService.httpDelete(endpoint, {});
    },

    reportAbuse(universeId, gameUpdateCreatedOn) {
      const url = urlService.getAbsoluteUrl(
        endpoints.getAbuseReportUrl(
          universeId,
          gameUpdateCreatedOn,
          encodeURIComponent($window.location.href)
        )
      );

      if (AbuseReportDispatcher) {
        AbuseReportDispatcher.triggerUrlAction(url);
      } else {
        $window.location.href = url;
      }
    }
  };
}

notificationStreamModule.factory('gameUpdatesService', gameUpdatesService);

export default gameUpdatesService;
