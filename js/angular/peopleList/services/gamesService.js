import { GameLauncher } from 'Roblox';
import peopleListModule from '../peopleListModule';

function gamesService($q, resources, httpService) {
  'ngInject';

  const { apiSets } = resources;
  return {
    joinGame(placeId, gameInstanceId) {
      GameLauncher.joinGameInstance(placeId, gameInstanceId, true, true);
    },

    multiGetPlaceDetails(placeIds) {
      const params = { placeIds };
      return httpService
        .httpGet(apiSets.multiGetPlaceDetails, params)
        .then(function success(placeDetails) {
          const imageTokens = [];
          const placeDetailDict = {};
          angular.forEach(placeDetails, function(placeDetail) {
            if (placeDetail && placeDetail.imageToken) {
              imageTokens.push(placeDetail.imageToken);
            }
            placeDetailDict[placeDetail.placeId] = placeDetail;
          });
          return placeDetailDict;
        });
    }
  };
}

peopleListModule.factory('gamesService', gamesService);

export default gamesService;
