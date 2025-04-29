import angular from 'angular';
import chatModule from '../chatModule';

function gameUtility($log) {
  'ngInject';

  return {
    isGameExistedInPlacesLibrary(placesLibrary, universeId) {
      let placeId = null;
      angular.forEach(placesLibrary, function(place) {
        if (place.universeId === universeId) {
          placeId = place.placeId;
          return false;
        }
      });
      return placeId;
    }
  };
}

chatModule.factory('gameUtility', gameUtility);

export default gameUtility;
