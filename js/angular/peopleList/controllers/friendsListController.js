import angular from 'angular';
import peopleListModule from '../peopleListModule';

function friendsListController($scope, $log, $document, eventStreamService, resources, $timeout) {
  'ngInject';

  $scope.clickAvatar = function (friend, index) {
    const eventStreamParams = resources.eventStreamParams.goToProfileFromAvatar;
    const properties = {
      friendId: friend.id,
      presentStatus: friend.presence.userPresenceType,
      position: index
    };

    if (friend.presence.rootPlaceId) {
      properties.rootPlaceId = friend.presence.rootPlaceId;
    }
    eventStreamService.sendEventWithTarget(
      eventStreamParams.name,
      eventStreamParams.ctx,
      properties
    );
  };

  $scope.clickPlaceLink = function (friend, index) {
    const eventStreamParams = resources.eventStreamParams.goToGameDetailFromAvatar;
    const properties = {
      friendId: friend.id,
      position: index,
      rootPlaceId: friend.presence.rootPlaceId
    };

    eventStreamService.sendEventWithTarget(
      eventStreamParams.name,
      eventStreamParams.ctx,
      properties
    );
  };

  $scope.updatePresenceStatus = function (responses) {
    const placeIdsNotInPlacesDict = [];
    for (let i = 0; i < responses.length; i++) {
      const presenceData = responses[i];
      if (presenceData.rootPlaceId && !$scope.library.placesDict[presenceData.rootPlaceId]) {
        placeIdsNotInPlacesDict.push(presenceData.rootPlaceId);
      }
      $scope.updatePresenceData(presenceData);
    }
    if (placeIdsNotInPlacesDict.length > 0 && angular.isFunction($scope.setPlaceDetails)) {
      $scope.setPlaceDetails(placeIdsNotInPlacesDict);
    }
  };

  $scope.listenToPresenceUpdate = function () {
    document.addEventListener('Roblox.Presence.Update', event => {
      if (event?.detail) {
        $timeout(() => {
          $scope.updatePresenceStatus(event.detail);
        });
      }
    });
  };

  $scope.init = function () {
    $scope.listenToPresenceUpdate();
  };

  $scope.init();
}

peopleListModule.controller('friendsListController', friendsListController);

export default friendsListController;
