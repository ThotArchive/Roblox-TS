import { EnvironmentUrls, GameLauncher } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function gameService(
  chatUtility,
  httpService,
  $log,
  $q,
  apiParamsInitialization,
  gameParameters,
  gameLayout,
  urlService,
  $filter
) {
  'ngInject';

  const apiSets = {};

  function multiGetPlaceDetails(placeIds) {
    const params = { placeIds };
    return httpService
      .httpGet(apiSets.multiGetPlaceDetails, params)
      .then(function success(placeDetails) {
        const placeDetailDict = {};
        angular.forEach(placeDetails, function (placeDetail) {
          placeDetailDict[placeDetail.placeId] = placeDetail;
        });
        return placeDetailDict;
      });
  }

  function multiGetPlaceDetailsForLinkCard(placeIds, getPlaceForMessages) {
    const params = { placeIds };
    return httpService.httpGet(apiSets.multiGetPlaceDetails, params).then(function (placeDetails) {
      if (placeDetails && placeDetails.length > 0) {
        const result = {};

        placeDetails.forEach(function (placeDetail) {
          result[placeDetail.placeId] = placeDetail;
        });

        const inValidPlaceIds = [];
        placeIds.forEach(function (placeId) {
          if (!result[placeId]) {
            result[placeId] = null;
            inValidPlaceIds.push(placeId);
          }
        });
        getPlaceForMessages.forEach(function (message) {
          if (message && message.linkCardMessages) {
            message.linkCardMessages.forEach(function (pieceOfMessage) {
              if (pieceOfMessage.isCard && inValidPlaceIds.indexOf(pieceOfMessage.id) > -1) {
                pieceOfMessage.isCard = false;
              }
            });
          }
        });
        return result;
      }
    });
  }

  function addGameIconUrlsToPlacesLibrary(chatLibrary, gameIcons) {
    angular.forEach(gameIcons, function (gameIconUrl, placeId) {
      if (gameIconUrl) {
        chatLibrary.placesLibrary[placeId].gameIconUrl = gameIconUrl;
        const place = chatLibrary.placesLibrary[placeId];
        chatLibrary.universeLibrary[place.universeId] = place;
      }
    });
  }

  function buildPlacesLibrary(chatLibrary, placeDetailsData, messageDictByPlaceIds) {
    angular.forEach(placeDetailsData, function (placeDetail, placeId) {
      if (placeDetail) {
        let originalPlaceData;
        if (chatLibrary.placesLibrary[placeId]) {
          originalPlaceData = chatLibrary.placesLibrary[placeId];
        }
        const creatorName = placeDetail.creatorName ? placeDetail.creatorName : placeDetail.builder;
        chatLibrary.placesLibrary[placeId] = {
          universeId: placeDetail.universeId,
          placeId,
          rootPlaceId:
            placeDetail.universeRootPlaceId || placeDetail.placeId || placeDetail.rootPlaceId,
          placeName: placeDetail.name,
          encodedPlaceName: chatUtility.htmlEntities(placeDetail.name),
          creatorName,
          encodedCreatorName: chatUtility.htmlEntities(creatorName),
          creatorId: placeDetail.creatorId || placeDetail.builderId,
          gameIconUrl: placeDetail.gameIconUrl,
          placeUrl: placeDetail.url || placeDetail.placeUrl,
          reasonProhibited: placeDetail.reasonProhibited,
          description: placeDetail.description,
          price: placeDetail.price,
          isPlayable: placeDetail.isPlayable,
          gameReferralUrl: placeDetail.gameReferralUrl
        };

        if (originalPlaceData) {
          // avoid existing place key/value from overriding
          angular.forEach(originalPlaceData, function (value, key) {
            if (!chatLibrary.placesLibrary[placeId][key]) {
              chatLibrary.placesLibrary[placeId][key] = value;
            }
          });
        }

        if (placeDetail.reasonProhibited) {
          switch (placeDetail.reasonProhibited) {
            case gameParameters.reasonProhibitedMessage.None:
            case gameParameters.reasonProhibitedMessage.Playable:
              chatLibrary.placesLibrary[placeId].buttonLayoutForLinkCard = angular.copy(
                gameLayout.playButtons.play
              );
              break;
            case gameParameters.reasonProhibitedMessage.PurchaseRequired:
              chatLibrary.placesLibrary[placeId].buttonLayoutForLinkCard = angular.copy(
                gameLayout.playButtons.details
              );
              break;
            default:
              chatLibrary.placesLibrary[placeId].buttonLayoutForLinkCard = angular.copy(
                gameLayout.playButtons.details
              );
              break;
          }
        }
        // transfer to use universeLibrary
        chatLibrary.universeLibrary[placeDetail.universeId] = chatLibrary.placesLibrary[placeId];
      } else if (!placeDetail && chatLibrary.placesLibrary[placeId]) {
        chatLibrary.placesLibrary[placeId] = {
          isInvalid: true
        };
        if (messageDictByPlaceIds) {
          chatUtility.invalidateLinkCardInPieceOfMessage(placeId, messageDictByPlaceIds);
        }
      }
    });
  }

  function invalidatePlaceDetails(chatLibrary, placeIds) {
    placeIds.forEach(function (placeId) {
      if (!chatLibrary.placesLibrary[placeId]) {
        chatLibrary.placesLibrary[placeId] = {};
      }
      chatLibrary.placesLibrary[placeId] = {
        isInvalid: true
      };
    });
  }

  function buildRegularPlaceUrl(place) {
    const gameUrl = urlService.getAbsoluteUrl(gameParameters.gameUrl);
    return $filter('formatString')(gameUrl, { placeId: place.placeId });
  }

  function buildGameReferralUrl(place, sortName) {
    const urls = urlService.getGameDetailReferralUrls();
    const urlInChatTemplate = urls.chat;
    const formattedUrl = $filter('formatString')(urlInChatTemplate, {
      sortName,
      placeId: place.placeId
    });
    return urlService.getAbsoluteUrl(formattedUrl);
  }

  return {
    apiSets,

    setParams(gameApiDomain) {
      apiSets.multiGetPlaceDetails = {
        url: gameApiDomain + apiParamsInitialization.gameUrls.multiGetPlaceDetails,
        retryable: true,
        withCredentials: true
      };
      apiSets.getGamesByUniverseIds = {
        url: apiParamsInitialization.gameUrls.getGamesByUniverseIds,
        retryable: true,
        withCredentials: true
      };
      apiSets.multiGetPlayabilityStatus = {
        url: apiParamsInitialization.gameUrls.multiGetPlayabilityStatus,
        retryable: true,
        withCredentials: true
      };
    },

    setConversationUniverse(conversationId, universeId) {
      const data = {
        conversationId,
        universeId
      };
      return httpService.httpPost(apiSets.setConversationUniverse, data);
    },

    resetConversationUniverse(conversationId) {
      const data = {
        conversationId
      };
      return httpService.httpPost(apiSets.resetConversationUniverse, data);
    },

    multiGetPlaceDetailsForLinkCard,

    multiGetPlaceDetails,

    playRegularGame(placeId, isPlayTogetherGame, joinAttemptId, joinAttemptOrigin) {
      isPlayTogetherGame = isPlayTogetherGame === true;
      GameLauncher.joinMultiplayerGame(
        placeId,
        true,
        isPlayTogetherGame,
        joinAttemptId,
        joinAttemptOrigin
      );
    },

    playTogetherGame(placeId, conversationId, joinAttemptId, joinAttemptOrigin) {
      GameLauncher.playTogetherGame(placeId, conversationId, joinAttemptId, joinAttemptOrigin);
    },

    joinGame(placeId, gameInstanceId, joinAttemptId, joinAttemptOrigin) {
      GameLauncher.joinGameInstance(
        placeId,
        gameInstanceId,
        true,
        true,
        joinAttemptId,
        joinAttemptOrigin
      );
    },

    playPrivateServerGame(placeId, privateServerLinkCode, joinAttemptId, joinAttemptOrigin) {
      GameLauncher.joinPrivateGame(
        placeId,
        null,
        privateServerLinkCode,
        joinAttemptId,
        joinAttemptOrigin
      );
    },

    fetchDataForLinkCard(messages, chatLibrary) {
      if (!messages) {
        return false;
      }
      const placeIds = []; // placeId does not exist in placesLibrary
      const messageDictByPlaceIds = {};
      const getPlaceForMessages = [];
      messages.forEach(function (message) {
        if (message.hasLinkCard) {
          const { linkCardMessages } = message;
          linkCardMessages.forEach(function (pieceOfMessage) {
            if (pieceOfMessage.isCard) {
              switch (pieceOfMessage.type) {
                case chatUtility.linkCardTypes.gameCard:
                  var placeId = pieceOfMessage.id;
                  if (
                    !chatUtility.isPlaceDetailQualifiedInLibrary(chatLibrary.placesLibrary, placeId)
                  ) {
                    getPlaceForMessages.push(message);

                    if (placeIds.indexOf(placeId) < 0) {
                      placeIds.push(placeId);
                      messageDictByPlaceIds[placeId] = message;
                    }
                  } else if (
                    chatLibrary.placesLibrary[placeId] &&
                    chatLibrary.placesLibrary[placeId].isInvalid
                  ) {
                    pieceOfMessage.isCard = false;
                  }
                  break;
              }
            }
          });
        }
      });

      if (placeIds.length > 0) {
        multiGetPlaceDetailsForLinkCard(placeIds, getPlaceForMessages).then(
          function (placeDetails) {
            if (!placeDetails) {
              invalidatePlaceDetails(chatLibrary, placeIds);
              chatUtility.invalidateLinkCardsInMessageDict(placeIds, messageDictByPlaceIds);
              return false;
            }
            buildPlacesLibrary(chatLibrary, placeDetails, messageDictByPlaceIds);
          },
          function () {
            invalidatePlaceDetails(chatLibrary, placeIds);
            chatUtility.invalidateLinkCardsInMessageDict(placeIds, messageDictByPlaceIds);
          }
        );
      }
    },

    updateButtonLayoutPerConversation(conversation, rootPlaceId) {
      if (
        !conversation.placeButtonLayout ||
        (conversation.placeButtonLayout && !conversation.placeButtonLayout[rootPlaceId].isPlayable)
      ) {
        return false;
      }
      if (
        conversation.pinGame &&
        conversation.playTogetherIds &&
        conversation.playTogetherIds.indexOf(rootPlaceId) > -1
      ) {
        conversation.placeButtonLayout[rootPlaceId] = angular.copy(gameLayout.playButtons.join);
      } else {
        conversation.placeButtonLayout[rootPlaceId] = angular.copy(gameLayout.playButtons.play);
      }
    },

    buildButtonLayoutPerConversation(conversation, placesLibrary) {
      let placeIds = [];
      let rootPlaceIdForPinGame = null;
      let isPinGameAnActiveGame = true;
      if (conversation.playTogetherIds && conversation.playTogetherIds.length > 0) {
        placeIds = angular.copy(conversation.playTogetherIds);
      }
      if (conversation.pinGame) {
        rootPlaceIdForPinGame = conversation.pinGame.rootPlaceId;
        if (placeIds.indexOf(rootPlaceIdForPinGame) < 0) {
          isPinGameAnActiveGame = false;
          placeIds.push(rootPlaceIdForPinGame);
        }
      }

      if (!conversation.placeButtonLayout) {
        conversation.placeButtonLayout = {};
      }
      angular.forEach(placeIds, function (placeId) {
        const placeDetails = placesLibrary[placeId];
        if (placeDetails) {
          switch (placeDetails.reasonProhibited) {
            case gameParameters.reasonProhibitedMessage.None:
            case gameParameters.reasonProhibitedMessage.Playable:
              if (!isPinGameAnActiveGame && placeId === rootPlaceIdForPinGame) {
                conversation.placeButtonLayout[placeId] = angular.copy(gameLayout.playButtons.play);
              } else {
                conversation.placeButtonLayout[placeId] = angular.copy(gameLayout.playButtons.join);
              }
              break;
            case gameParameters.reasonProhibitedMessage.PurchaseRequired:
              conversation.placeButtonLayout[placeId] = angular.copy(
                gameLayout.playButtons.details
              );
              break;
            default:
              conversation.placeButtonLayout[placeId] = angular.copy(
                gameLayout.playButtons.notAvailable
              );
              break;
          }
        }
      });
    },
    buildPlacesLibrary,

    getGames(universeIds) {
      const params = {
        universeIds
      };
      const promises = {};
      promises.getGamesInfo = httpService.httpGet(apiSets.getGamesByUniverseIds, params);
      promises.getPlayabilityStatus = httpService.httpGet(
        apiSets.multiGetPlayabilityStatus,
        params
      );
      return $q.all(promises).then(function success(results) {
        if (results && results.getGamesInfo && results.getPlayabilityStatus) {
          const gameInfo = results.getGamesInfo.data;
          const playabilityStatus = results.getPlayabilityStatus;
          const placeLibrary = {};
          const universeLibrary = {};
          angular.forEach(gameInfo, function (game, idx) {
            const placeId = game.rootPlaceId;
            const { universeId } = playabilityStatus[idx];
            placeLibrary[placeId] = game;
            placeLibrary[placeId].universeId = universeId;
            placeLibrary[placeId].placeId = placeId;
            placeLibrary[placeId].isPlayable = playabilityStatus[idx].isPlayable;
            placeLibrary[placeId].reasonProhibited = playabilityStatus[idx].playabilityStatus;
            placeLibrary[placeId].placeUrl = buildRegularPlaceUrl(placeLibrary[placeId]);
            universeLibrary[universeId] = placeLibrary[placeId];
          });
          return placeLibrary;
        }
      });
    }
  };
}

chatModule.factory('gameService', gameService);

export default gameService;
