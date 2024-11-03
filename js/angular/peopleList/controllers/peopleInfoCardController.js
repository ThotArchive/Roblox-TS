import peopleListModule from '../peopleListModule';
import { urlService } from 'core-utilities';
import { sessionStorageService } from 'core-roblox-utilities';

function peopleInfoCardController(
  $scope,
  $log,
  resources,
  layoutService,
  chatDispatchService,
  $window,
  gamesService,
  eventStreamService,
  playGameService
) {
  'ngInject';

  $scope.sendEventStream = function(eventType, properties) {
    if (!properties) {
      properties = {};
    }
    properties.friendId = $scope.friend.id;
    properties.position = $scope.$index;
    eventStreamService.sendEventWithTarget(eventType.name, eventType.ctx, properties);
  };

  $scope.sendGamePlayEvent = function(rootPlaceId) {
    eventStreamService.sendGamePlayEvent(
      resources.eventStreamParams.gamePlayIntentInPeopleList.ctx,
      rootPlaceId
    );
  };

  $scope.sendGameImpressionEvent = function(universeId, rootPlaceId, index) {
    const { pageContexts } = resources.eventStreamParams;
    const { homePageSessionInfo } = sessionStorageService.getEventTracker();

    const eventProperties = {
      // Arrays must be JSON-encoded or eventStream will send the param names like universeIds[], which
      // does not appear to be properly handled on the server side, as the parameter name in the events
      // table will actually be "universeIds[]"
      universeIds: JSON.stringify([universeId]),
      rootPlaceIds: JSON.stringify([rootPlaceId]),
      absPositions: JSON.stringify([0]),
      sortPos: 0,
      page: pageContexts.peopleListInHomePage,
      homePageSessionInfo
    };

    $scope.sendEventStream(resources.eventStreamParams.gameImpressions, eventProperties);
  }

  $scope.clickBtn = function(where) {
    const { rootPlaceId } = $scope.friend.presence;
    const placeDetail = $scope.library.placesDict[rootPlaceId];
    const playButtonTypes = layoutService.playButtons;
    const propertiesForEvent = {
      rootPlaceId
    };
    const { eventStreamParams } = resources;
    switch (placeDetail.buttonLayout.type) {
      case playButtonTypes.join.type:
        var gameInstanceId = $scope.friend.presence.gameId;
        var playerId = $scope.friend.id;
        var playGameProperties = playGameService.buildPlayGameProperties(
          rootPlaceId,
          $scope.friend.presence.placeId,
          gameInstanceId,
          playerId
        );
        propertiesForEvent.gameInstanceId = gameInstanceId;
        propertiesForEvent.friendId = $scope.friend.id;
        propertiesForEvent.position = $scope.$index;
        var eventStreamProperties = {
          eventName: eventStreamParams.joinGameInPeopleList.name,
          ctx: eventStreamParams.joinGameInPeopleList.ctx,
          properties: propertiesForEvent,
          gamePlayIntentEventCtx: resources.eventStreamParams.gamePlayIntentInPeopleList.ctx
        };
        playGameService.launchGame(playGameProperties, eventStreamProperties);
        break;
      case playButtonTypes.details.type:
        $scope.goToGameDetails(where);
        break;
    }
  };

  $scope.goToGameDetails = function(fromWhere) {
    const { eventStreamParams } = resources;
    const { rootPlaceId, universeId, userId: friendId } = $scope.friend.presence;
    const page = eventStreamParams.pageContexts.peopleListInHomePage;
    const propertiesForEvent = {
      rootPlaceId,
      fromWhere,
      page
    };

    $scope.sendEventStream(
      eventStreamParams.goToGameDetailInPeopleList,
      propertiesForEvent
    );

    const { homePageSessionInfo } = sessionStorageService.getEventTracker();
    const urlParams = { 
      page, 
      friendId, 
      universeId,
      placeId: rootPlaceId,
      position: 0,
      homePageSessionInfo
    };
  
    const url = `${$scope.friend.presence.placeUrl}?${urlService.composeQueryString(urlParams)}`;
    $window.location.href = urlService.getAbsoluteUrl(url);
  };

  $scope.goToChat = function() {
    const userId = $scope.friend.id;
    $scope.sendEventStream(resources.eventStreamParams.goToChatInPeopleList);
    const chatPermissionVerifier = chatDispatchService.buildPermissionVerifier({});
    chatDispatchService.startChat(userId, chatPermissionVerifier);
  };

  $scope.goToProfilePage = function() {
    $scope.sendEventStream(resources.eventStreamParams.goToProfileInPeopleList);
    $window.location.href = urlService.getAbsoluteUrl($scope.friend.profileUrl);
  };

  $scope.init = function() {
    $scope.sendEventStream(resources.eventStreamParams.openPeopleList);
    
    const { presence } = $scope.friend;
    if (presence?.universeId && presence?.rootPlaceId) {
      $scope.sendGameImpressionEvent(presence.universeId, presence.rootPlaceId, $scope.$index);
    }
  };

  $scope.init();
}

peopleListModule.controller('peopleInfoCardController', peopleInfoCardController);

export default peopleInfoCardController;
