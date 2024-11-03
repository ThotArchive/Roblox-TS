import { RealTime } from 'Roblox';
import angular from 'angular';
import { cryptoUtil } from 'core-roblox-utilities';
import notificationStreamModule from '../notificationStreamModule';

function notificationStreamController(
  $scope,
  $document,
  $timeout,
  notificationStreamService,
  notificationStreamUtility,
  notificationStreamConstants,
  eventStreamService,
  gameUpdatesService,
  gameUpdatesUtility,
  gameUpdatesConstants,
  $log,
  layoutLibraryService
) {
  'ngInject';

  const { parseEpochMilliseconds } = notificationStreamUtility;
  const { notificationSourceType } = layoutLibraryService;

  async function createSendrBundle(bundleKey, notifications) {
    const notificationIds = notifications.map(x => x.id);
    const bundleId = await cryptoUtil.hashStringWithSha256(
      `${JSON.stringify(notificationIds)}${Date.now()}`
    );
    eventStreamService.sendEventWithTarget(
      eventStreamService.eventNames.notificationStream.notificationsBundleCreated,
      eventStreamService.context.fetched,
      {
        ...notifications[0]?.content?.clientEventsPayload,
        bundleKey,
        bundleId,
        totalNotifications: notifications.length,
        notificationIds
      }
    );
    return {
      bundleKey,
      bundleId,
      notificationSourceType: notificationSourceType.sendrBundle,
      eventDate: notifications[0].eventDate,
      notifications
    };
  }

  $scope.buildNotificationsList = function (notifications) {
    const userIds = [];
    const sendrBundles = {};
    const enableSendrBundling = true;

    notifications.forEach(function (notification) {
      const metaDataCollection = notification.metadataCollection;
      const notificationType = notification.notificationSourceType;

      let logNotificationType = notification.notificationSourceType;
      let sendrVersion = '0';

      if (notification.content?.notificationType) {
        logNotificationType = notification.content.notificationType;
        sendrVersion = notification.content.minVersion.toString();
      }

      eventStreamService.sendEventWithTarget(
        eventStreamService.eventNames.notificationStream.notificationRetrieved,
        eventStreamService.context.fetched,
        {
          ...notification?.content?.clientEventsPayload,
          sendrVersion,
          notificationType: logNotificationType,
          notificationId: notification.id
        }
      );

      if (!notificationStreamUtility.isNotificationTypeValid(notificationType)) {
        return;
      }

      if (
        !notificationStreamUtility.isGameUpdateNotification(notificationType) &&
        !notificationStreamUtility.isReactNotification(notificationType)
      ) {
        metaDataCollection.forEach(function (userData) {
          const user = notificationStreamUtility.normalizeUser(notificationType, userData);
          if (user && user.userId != null && user.userName != null) {
            const { userId } = user;
            const { userName } = user;
            if ($scope.library.userIdList.indexOf(userId) > -1) {
              return false;
            }
            userIds.push(userId);
            $scope.library.userIdList.push(userId);
            $scope.library.userLibrary[userId] = {
              id: userId,
              name: userName,
              profileLink: notificationStreamUtility.getAbsoluteUrl(
                notificationStreamUtility.links.profileLink,
                { id: userId }
              )
            };
          }
        });
      }

      notification.isClickable = notificationStreamUtility.isCardClickable(notification);

      if ($scope.notificationIds.indexOf(notification.id) < 0) {
        $scope.notificationIds.push(notification.id);
      }

      const bundleKey = notification.content?.bundleKey;
      if (enableSendrBundling && bundleKey) {
        if (!sendrBundles[bundleKey]) {
          sendrBundles[bundleKey] = [];
        }
        sendrBundles[bundleKey].push(notification);
      } else {
        $scope.notifications[notification.id] = notification;
      }
    });

    Object.entries(sendrBundles).forEach(async ([bundleKey, bundleNotifications]) => {
      const notificationId = bundleNotifications[0]?.id;
      if (notificationId) {
        $scope.notifications[notificationId] = await createSendrBundle(
          bundleKey,
          bundleNotifications
        );
      }
    });

    $scope.layout.emptyNotificationEnabled = $scope.notificationIds.length === 0;
  };

  // Builds aggregate game update notification and populates
  // the model collection.
  $scope.buildGameUpdateNotifications = function (gameUpdateNotifications) {
    if (!gameUpdateNotifications || gameUpdateNotifications.length === 0) {
      return;
    }

    const { gameUpdateModels } = $scope.library;

    // Start getting game followings, for retrieving full list of game updates.
    // This is due to notification stream keeping only latest 3 updates per 12-hour bucket.
    gameUpdatesService
      .getGameFollowingsForUserAsync($scope.library.currentUserId)
      .then(function (gameFollowings) {
        let i;
        const universeIds = [];

        // Get list of followed universe ids
        for (i = 0; i < gameFollowings.length; i++) {
          universeIds.push(gameFollowings[i].universeId);
        }

        // Start getting game updates.
        return gameUpdatesUtility.getGameUpdatesAsync(universeIds, gameUpdateModels);
      })
      .then(function (gameUpdates) {
        const aggregateNotification = gameUpdatesUtility.aggregateGameUpdateNotifications(
          gameUpdateNotifications,
          gameUpdateModels
        );
        let singleGameUpdateModel;

        if (!aggregateNotification) {
          return;
        }

        // Add aggregated game update to list of all notifications.
        $scope.notifications[aggregateNotification.id] = aggregateNotification;
        $scope.notificationIds.unshift(aggregateNotification.id);

        // Fill in game details and icons for models that still need them.
        gameUpdatesUtility.fillGameDetails(gameUpdateModels);

        if (aggregateNotification.metadataCollection.length === 1) {
          singleGameUpdateModel =
            gameUpdateModels[aggregateNotification.metadataCollection[0].UniverseId];

          // Send metrics event for single notification.
          gameUpdatesService.markGameUpdateInteractedAsync(
            singleGameUpdateModel.universeId,
            singleGameUpdateModel.createdOnKey,
            gameUpdatesConstants.gameUpdateInteractions.seen,
            $scope.library.currentUserId
          );
        }

        const sortedGameUpdateModels = gameUpdatesUtility.sortGameUpdatesByCreatedDate(
          gameUpdateModels,
          false
        );
        const now = parseEpochMilliseconds(new Date().toUTCString());
        const secondsinTwoWeeks = 86400 * 14;
        let recentGroupedNotificationCount = 0;
        for (let i = 0; i < sortedGameUpdateModels.length; i++) {
          const gameUpdateModel = sortedGameUpdateModels[i];
          if (now / 1000 - gameUpdateModel.createdOn / 1000 <= secondsinTwoWeeks) {
            recentGroupedNotificationCount++;
          } else {
            break;
          }
        }

        eventStreamService.sendEventWithTarget(
          notificationStreamConstants.recentGameUpdateRetrievedEventName,
          eventStreamService.context.fetched,
          {
            sendrVersion: '0',
            notificationType: 'GameUpdate',
            notificationId: aggregateNotification.id,
            recentGroupedNotificationCount
          }
        );
      });
  };

  $scope.getRecentNotifications = function () {
    $scope.layout.getRecentDataInitialized = false;

    notificationStreamService
      .getRecentNotifications(
        $scope.notificationApiParams.startIndexOfNotifications,
        $scope.notificationApiParams.pageSizeOfNotifications
      )
      .then(
        function (recentNotifications) {
          const gameUpdates = [];
          const otherNotifications = [];

          $scope.layout.getRecentDataInitialized = true;
          $scope.layout.isGetRecentDataLoadedRequested = false;

          if (recentNotifications && recentNotifications.length > 0) {
            // Separate game updates from other types of notifications.
            angular.forEach(recentNotifications, function (entry) {
              if (
                notificationStreamUtility.isGameUpdateNotification(entry.notificationSourceType)
              ) {
                gameUpdates.push(entry);
              } else {
                otherNotifications.push(entry);
              }
            });

            $scope.buildNotificationsList(otherNotifications);

            if (gameUpdates.length > 0) {
              $scope.buildGameUpdateNotifications(gameUpdates);
            }

            // Paging.
            $scope.layout.isLazyLoadingRequested = true;
            if (recentNotifications.length > 0) {
              $scope.notificationApiParams.startIndexOfNotifications =
                $scope.notificationApiParams.startIndexOfNotifications +
                $scope.notificationApiParams.pageSizeOfNotifications;
              $scope.notificationApiParams.loadMoreNotifications = true;
            }
          }
        },
        function () {
          $log.debug('--- getRecentNotifications call failed ----- ');
          $scope.layout.getRecentDataInitialized = true;
        }
      );
  };

  $scope.setNotificationContentOpen = function (isOpen) {
    $scope.layout.isNotificationContentOpen = isOpen;

    if (!isOpen) {
      window.removeEventListener(
        'Roblox.NotificationStream.StreamClosed',
        $scope.handleStreamClosed
      );

      const realTimeClient = RealTime.Factory.GetClient();

      realTimeClient.Unsubscribe(
        notificationStreamUtility.notificationsName.NotificationStream,
        $scope.handleNotificationStreamNotification
      );
    }
  };

  $scope.clearUnreadNotifications = function () {
    if ($scope.library.unreadNotifications > 0) {
      $scope.library.unreadNotifications = 0;
      $document.triggerHandler('Roblox.NotificationStream.UpdateNotificationsCount', {
        count: 0,
        isNotificationContentOpen: $scope.layout.isNotificationContentOpen
      });
    }
  };

  $scope.openNotificationStream = function () {
    if ($scope.layout.isGetRecentDataLoadedRequested) {
      $scope.resetNotificationStreamData();
      $scope.getRecentNotifications();
    }

    $document.triggerHandler('Roblox.NotificationStream.ClearUnreadNotifications', {});
    $scope.clearUnreadNotifications();
  };

  $scope.toggleNotificationContent = function (forceHidden) {
    if (forceHidden) {
      $scope.setNotificationContentOpen(false);
    } else {
      if (!$scope.library.inApp) {
        $scope.setNotificationContentOpen(!$scope.layout.isNotificationContentOpen);
      }
      if ($scope.layout.isNotificationContentOpen && $scope.layout.isGetRecentDataLoadedRequested) {
        $scope.openNotificationStream();
      }
    }

    if ($scope.layout.isNotificationContentOpen && $scope.layout.bannerEnabled) {
      $scope.layout.bannerEnabled = false;
    }

    if ($scope.layout.isLazyLoadingRequested) {
      $scope.layout.isLazyLoadingRequested = false;
    }
  };

  $scope.getUnreadNotificationCount = function () {
    return notificationStreamService.unreadCount().then(
      function (data) {
        if (data) {
          $scope.library.unreadNotifications = data.unreadNotifications;
          const count = data.unreadNotifications;
          const { isNotificationContentOpen } = $scope.layout;
          if (!isNotificationContentOpen) {
            $document.triggerHandler('Roblox.NotificationStream.UpdateNotifications', {
              count: data.unreadNotifications,
              isNotificationContentOpen
            });
          } else {
            $scope.layout.bannerText = notificationStreamUtility.textTemplate.newNotification(
              $scope.library.unreadNotifications
            );
          }

          if ($scope.layout.unreadNotifications !== count && count > 0) {
            let eventName;
            if (isNotificationContentOpen) {
              eventName = eventStreamService.eventNames.notificationStream.refreshCTA;
            } else {
              eventName = eventStreamService.eventNames.notificationStream.openCTA;
            }

            eventStreamService.sendEventWithTarget(eventName, eventStreamService.context.seen, {
              count,
              sendrVersion: 0
            });
          }
        }
      },
      function () {
        $log.debug('--- unreadCount call failed ----- ');
      }
    );
  };

  $scope.resetNotificationStreamData = function () {
    $scope.notificationIds = [];
    $scope.notifications = {};
    if ($scope.notificationApiParams) {
      $scope.notificationApiParams.startIndexOfNotifications = 0;
    }
  };

  $scope.reloadNotificationStreamData = function () {
    $scope.resetNotificationStreamData();
    $document.triggerHandler('Roblox.NotificationStream.ClearUnreadNotifications', {});
    $scope.getRecentNotifications();
    $scope.layout.bannerEnabled = false;
  };

  $scope.updateNewNotificationInfo = function () {
    $scope.layout.isGetRecentDataLoadedRequested = true;
    $scope.getUnreadNotificationCount();
    $scope.$evalAsync(function () {
      if ($scope.layout.isNotificationContentOpen) {
        $scope.layout.bannerEnabled = true;
      }
    });
  };

  $scope.updateSettingsInLibrary = function (data) {
    $scope.library.bannerDismissTimeSpan = data.bannerDismissTimeSpan;
    $scope.library.signalRDisconnectionResponseInMilliseconds =
      data.signalRDisconnectionResponseInMilliseconds;

    $scope.library.eventStreamMetaData = {
      userId: $scope.library.currentUserId,
      inApp: $scope.library.inApp
    };

    // Switch for launching game from game updates.
    $scope.library.canLaunchGameFromGameUpdate = data.canLaunchGameFromGameUpdate;
  };

  $scope.handleSignalRSuccess = function () {
    $scope.$evalAsync(function () {
      $scope.layout.errorBannerEnabled = false;
    });
  };

  $scope.handleSignalRError = function () {
    $timeout(function () {
      $scope.layout.errorBannerEnabled = true;
      $scope.layout.errorText = notificationStreamUtility.textTemplate.noNetworkConnectionText();
    }, $scope.library.signalRDisconnectionResponseInMilliseconds);
  };

  $scope.handleNotificationStreamNotification = function (data) {
    $log.debug(`--------- this is NotificationStream subscription -----------${data.Type}`);
    switch (data.Type) {
      case notificationStreamUtility.signalRType.NewNotification:
        $scope.updateNewNotificationInfo();
        break;
      case notificationStreamUtility.signalRType.NotificationsRead:
        $scope.clearUnreadNotifications();
        break;
      case notificationStreamUtility.signalRType.NotificationRevoked:
        $scope.getUnreadNotificationCount();
        if (!$scope.layout.isStreamBodyInteracted) {
          $scope.reloadNotificationStreamData();
        }
        break;
    }
  };

  $scope.getAccountSettingsPolicy = function () {
    notificationStreamService.getAccountSettingsPolicy().then(
      function success(data) {
        $scope.library.isNotificationPreferencesPageEnabled =
          data && data.displayReactNotificationsTab;
      },
      function error(e) {
        $log.debug(e);
      }
    );
  };

  $scope.closeErrorBanner = function () {
    $scope.layout.errorBannerEnabled = false;
    $scope.layout.errorText = '';
  };

  $scope.closeBanner = function () {
    $scope.layout.bannerEnabled = false;
    $scope.layout.bannerText = '';
  };

  $scope.getNotificationListItemClass = function (notification) {
    if (notificationStreamUtility.isReactNotification(notification.notificationSourceType)) {
      // Angular should not influence any of the styling for React notifications
      return '';
    }
    return {
      'notification-stream-item': true,
      unInteracted: !notification.isInteracted,
      'slide-out-left': notification.isSlideOut,
      'turn-off': notification.isTurnOff,
      clickable: notification.isClickable,
      'game-update': notificationStreamUtility.isGameUpdateNotification(
        notification.notificationSourceType
      )
    };
  };

  // // ----------------------------------- SignalR --------------------------------
  $scope.initializeRealTimeSubscriptions = function () {
    if (angular.isDefined(RealTime)) {
      const realTimeClient = RealTime.Factory.GetClient();
      realTimeClient.SubscribeToConnectionEvents(
        $scope.handleSignalRSuccess,
        $scope.handleSignalRSuccess,
        $scope.handleSignalRError,
        notificationStreamUtility.notificationsName.NotificationStream
      );

      realTimeClient.Subscribe(
        notificationStreamUtility.notificationsName.NotificationStream,
        $scope.handleNotificationStreamNotification
      );
    }
  };

  // // ----------------------------------- CODE TO RUN --------------------------------

  $scope.getUnreadNotificationCountFromDom = () => {
    const unreadNotificationElement = angular.element(
      '.notification-stream-icon .notification-red'
    );
    if (unreadNotificationElement && !Number.isNaN(unreadNotificationElement)) {
      $scope.library.unreadNotifications = parseInt(unreadNotificationElement.html(), 10);
    }
  };

  function initializeLayout() {
    $scope.layout = angular.copy(notificationStreamUtility.layout);
    $scope.notificationApiParams = angular.copy(notificationStreamUtility.notificationApiParams);
    if ($scope.library.inApp) {
      const properties = angular.copy($scope.library.eventStreamMetaData);
      properties.countOfUnreadNotification = $scope.library.unreadNotifications;
      properties.sendrVersion = 0;
      eventStreamService.sendEventWithTarget(
        eventStreamService.eventNames.notificationStream.openContent,
        eventStreamService.context.inApp,
        properties
      );
      $scope.getUnreadNotificationCount().then(function () {
        notificationStreamService.clearUnread().then(() => {
          $scope.library.unreadNotifications = 0;
        });
      });
      $scope.setNotificationContentOpen(true);
    } else {
      $scope.getUnreadNotificationCountFromDom();
    }
  }

  function initializePageData() {
    try {
      $scope.library = $scope.library || notificationStreamUtility.library;
      $scope.resetNotificationStreamData();
      $scope.getAccountSettingsPolicy();

      notificationStreamService.initialize().then(
        function (data) {
          if (data) {
            notificationStreamUtility.layout.pageDataInitialized = true;
            $scope.updateSettingsInLibrary(data);
          }
        },
        function () {
          $log.debug('----- initialize data request failed ----');
        }
      );
    } catch (e) {
      let message = 'initializePageData:';
      if (e && e.message) {
        message += e.message;
      }
      $log.debug(message);
    }
  }

  function initializeStream() {
    if (!$scope.layout.isNotificationContentOpen) {
      const properties = angular.copy($scope.library.eventStreamMetaData);
      properties.countOfUnreadNotification = $scope.library.unreadNotifications;
      properties.sendrVersion = 0;
      eventStreamService.sendEventWithTarget(
        eventStreamService.eventNames.notificationStream.openContent,
        'click',
        properties
      );
    }
    $scope.toggleNotificationContent();
  }

  $scope.handleStreamClosed = function () {
    $scope.setNotificationContentOpen(false);
  };

  $scope.initializeNotificationStream = function () {
    initializePageData();
    initializeLayout();
    initializeStream();
    $scope.initializeRealTimeSubscriptions();

    window.addEventListener('Roblox.NotificationStream.StreamClosed', $scope.handleStreamClosed);
  };

  $scope.initializeNotificationStream();
}

notificationStreamModule.controller('notificationStreamController', notificationStreamController);

export default notificationStreamController;
