import { GameLauncher } from 'Roblox';
import { urLService } from 'core-utilities';
import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function gameUpdate(
  $window,
  gameUpdatesService,
  gameUpdatesUtility,
  gameUpdatesConstants,
  notificationStreamUtility,
  hybridService,
  $log,
  $filter,
  thumbnailConstants,
  eventStreamService
) {
  'ngInject';

  const { gameUpdateInteractions } = gameUpdatesConstants;
  const notificationType = 'gameUpdate';

  return {
    restrict: 'A',
    replace: true,
    templateUrl(tElement, tAttrs) {
      return tAttrs.newDesign === undefined || tAttrs.newDesign === null
        ? notificationStreamUtility.templates.gameUpdateTemplate
        : notificationStreamUtility.templates.newGameUpdateTemplate;
    },

    scope: {
      library: '=',
      appMeta: '=',
      contentViewManager: '=',
      newDesign: '=?',
      notification: '=?',
      gameUpdateModel: '=?'
    },

    link(scope, element, attrs) {
      const gameUpdateElement = $(element);
      let metaDataCollection;

      if (!scope.gameUpdateModel) {
        if (!scope.notification) {
          return;
        }

        metaDataCollection = scope.notification.metadataCollection;

        if (metaDataCollection && metaDataCollection.length > 0) {
          scope.gameUpdateModel = scope.library.gameUpdateModels[metaDataCollection[0].UniverseId];
        }

        if (!scope.gameUpdateModel) {
          return;
        }
      }

      const notificationId = `${scope.gameUpdateModel.rootPlaceId}-${scope.gameUpdateModel.createdOn}`;

      scope.notificationSourceType = notificationStreamUtility.notificationSourceType;
      scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;

      if (metaDataCollection && metaDataCollection.length > 1) {
        // Aggregated message.
        scope.isAggregated = true;

        scope.aggregatedDisplayText = gameUpdatesUtility.formatAggregatedDisplayText(
          $filter('escapeHtml')(metaDataCollection[0].GameName),
          $filter('escapeHtml')(metaDataCollection[1].GameName),
          scope.notification.eventCount - 2
        );
      }

      scope.gameNameMaxLength = gameUpdatesUtility.gameNameMaxLength;
      scope.actionMenuTemplate = 'game-update-action-popover-template';

      // State of the action menu.
      scope.isActionMenuOpen = false;

      scope.getEventExtraParams = function () {
        return {
          notifId: notificationId,
          notifType: notificationType,
          pid: scope.gameUpdateModel.rootPlaceId,
          sourceId: scope.gameUpdateModel.universeId,
          isAggregate: scope.isAggregated ?? false,
          nsPage: scope.contentViewManager.getCurrentContentViewId(),
          sendrVersion: 0
        };
      };

      scope.$watch('isActionMenuOpen', function (newValue, oldValue) {
        if (newValue && !oldValue) {
          eventStreamService.sendEventWithTarget(
            eventStreamService.eventNames.notificationStream.openMetaActions,
            eventStreamService.context.click,
            scope.getEventExtraParams()
          );
        } else if (oldValue && !newValue) {
          eventStreamService.sendEventWithTarget(
            eventStreamService.eventNames.notificationStream.closeMetaActions,
            eventStreamService.context.click,
            scope.getEventExtraParams()
          );
        }
      });

      // Handler to go to game details page.
      scope.goToGameDetails = function () {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.goToGameDetails,
          eventStreamService.context.click,
          scope.getEventExtraParams()
        );

        if (scope.library.inApp) {
          hybridService.navigateToFeature({
            feature: 'GameDetails',
            urlPath: scope.gameUpdateModel.gameLinkUrlForApp
          });
        } else {
          $window.location.href = urlService.getAbsoluteUrl(scope.gameUpdateModel.gameLinkUrl);
        }
      };

      // Handler to launch game when play button is clicked.
      scope.playButtonHandler = function () {
        gameUpdatesService.markGameUpdateInteractedAsync(
          scope.gameUpdateModel.universeId,
          scope.gameUpdateModel.createdOnKey,
          gameUpdateInteractions.played,
          scope.library.currentUserId
        );

        if (scope.library.inApp) {
          hybridService.launchGame({
            placeId: scope.gameUpdateModel.rootPlaceId,
            requestType: 'RequestGame',
            isPartyLeader: false
          });
        } else {
          GameLauncher.joinMultiplayerGame(scope.gameUpdateModel.rootPlaceId, true, false);
        }

        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.launchExperience,
          eventStreamService.context.click,
          scope.getEventExtraParams()
        );
      };

      // Handler to show game updates inside an aggregated notification.
      scope.viewGameUpdates = function () {
        scope.contentViewManager.selectContentView(
          scope.library.notificationContentViews.gameUpdates
        );
        angular.forEach(scope.library.gameUpdateModels, function (gameUpdateModel) {
          if (!gameUpdateModel.seen) {
            gameUpdatesService
              .markGameUpdateInteractedAsync(
                gameUpdateModel.universeId,
                gameUpdateModel.createdOnKey,
                gameUpdateInteractions.seen,
                scope.library.currentUserId
              )
              .then(
                function () {
                  gameUpdateModel.seen = true;
                },
                function () {
                  // Failed to report game update seen interaction.
                }
              );
          }
        });
      };

      // Handler to follow the game.
      scope.followGame = function () {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.follow,
          eventStreamService.context.click,
          scope.getEventExtraParams()
        );

        gameUpdatesService
          .followGameAsync(scope.library.currentUserId, scope.gameUpdateModel.universeId)
          .then(
            function () {
              // Follow completed.
              gameUpdateElement.focus();
              scope.gameUpdateModel.isUnfollowed = false;

              // Get the game update message if needed.
              if (!scope.gameUpdateModel.updateMessage) {
                gameUpdatesUtility.getGameUpdatesAsync(
                  [scope.gameUpdateModel.universeId],
                  scope.library.gameUpdateModels,
                  null
                );
              }
            },
            function () {
              // TODO: Follow failed. Show error banner.
            }
          );
      };

      // Handler to unfollow the game.
      scope.unfollowGame = function ($event) {
        if ($event && $event.stopPropagation) {
          $event.stopPropagation();
        }

        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.unfollow,
          eventStreamService.context.click,
          scope.getEventExtraParams()
        );

        gameUpdatesService
          .unfollowGameAsync(scope.library.currentUserId, scope.gameUpdateModel.universeId)
          .then(
            function () {
              // Unfollow completed.
              gameUpdateElement.focus();
              scope.gameUpdateModel.isUnfollowed = true;
              scope.isActionMenuOpen = false;
              gameUpdatesService.markGameUpdateInteractedAsync(
                scope.gameUpdateModel.universeId,
                scope.gameUpdateModel.createdOnKey,
                gameUpdateInteractions.unfollowed,
                scope.library.currentUserId
              );
            },
            function () {
              // TODO: Unfollow failed. Show error banner.
            }
          );
      };

      // Handler to report abuse.
      scope.reportAbuse = function () {
        gameUpdatesService.reportAbuse(
          scope.gameUpdateModel.universeId,
          new Date(scope.gameUpdateModel.createdOn)
        );

        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.report,
          eventStreamService.context.click,
          scope.getEventExtraParams()
        );
      };

      // Handler for the Cancel item on the action menu.
      scope.closeActionMenu = function () {
        scope.isActionMenuOpen = false;
      };
    }
  };
}

notificationStreamModule.directive('gameUpdate', gameUpdate);

export default gameUpdate;
