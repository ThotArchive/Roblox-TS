import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function notificationsController(
  $scope,
  notificationStreamService,
  notificationStreamUtility,
  notificationStreamConstants,
  hybridService,
  eventStreamService,
  urlService,
  chatDispatchService,
  $document,
  $log
) {
  'ngInject';

  function sendEventStream(eventName, notificationId, eventType, extraProps = {}) {
    const notification = $scope.notifications[notificationId];
    const properties = angular.copy($scope.library.eventStreamMetaData);
    properties.notificationId = notificationId;
    properties.sendrVersion = 0;

    if (notification) {
      properties.notificationType = notification.notificationSourceType;
    }

    const allProperties = { ...properties, ...extraProps };
    eventStreamService.sendEventWithTarget(eventName, eventType, allProperties);
  }

  $scope.parseErrorFromApiResponse = function (response) {
    const error = response && response.errors && response.errors[0];
    return error;
  };

  $scope.acceptFriend = function (targetUserId, notificationId, event) {
    $log.debug('---------------- acceptFriend --------- ');
    const notification = $scope.notifications[notificationId];
    $scope.interactNotification(notification);

    notificationStreamService.acceptFriendV2(targetUserId).then(
      function (data) {
        $scope.onAcceptFriendSuccess(notificationId, event);
      },
      function (response) {
        const error = $scope.parseErrorFromApiResponse(response);
        if (error && error.userFacingMessage) {
          $scope.layout.errorText = error.userFacingMessage;
          $scope.layout.errorBannerEnabled = true;
        }
      }
    );
  };

  $scope.onAcceptFriendSuccess = function (notificationId, event) {
    const notification = $scope.notifications[notificationId];
    notification.friendRequestActionType =
      notificationStreamUtility.friendRequestActionType.chatBtn;
    notification.metadataCollection[0].IsAccepted = true;
    notification.isFlipped = true;
    $document.triggerHandler('Roblox.Friends.CountChanged');
    sendEventStream(
      eventStreamService.eventNames.notificationStream.acceptFriendRequest,
      notificationId,
      event.type
    );
  };

  $scope.ignoreFriend = function (targetUserId, notificationId, event) {
    $log.debug('---------------- ignoreFriend --------- ');
    const notification = $scope.notifications[notificationId];
    $scope.interactNotification(notification);

    notificationStreamService.ignoreFriendV2(targetUserId).then(
      function (data) {
        $scope.onIgnoreFriend(notificationId, event);
      },
      function (response) {
        $scope.onIgnoreFriend(notificationId, event);
      }
    );
  };

  $scope.onIgnoreFriend = function (notificationId, event) {
    const notification = $scope.notifications[notificationId];
    notification.isSlideOut = true;
    sendEventStream(
      eventStreamService.eventNames.notificationStream.ignoreFriendRequest,
      notificationId,
      event.type
    );
  };

  $scope.removeNotification = function (notificationId) {
    $log.debug(`---------------- removeNotification --------- notificationId:  ${notificationId}`);
    const index = $scope.notificationIds.indexOf(notificationId);
    $scope.notificationIds.splice(index, 1);
    delete $scope.notifications[notificationId];
  };

  $scope.chat = function (friendId, notificationId, event) {
    const notification = $scope.notifications[notificationId];
    $scope.interactNotification(notification);
    const chatPermissionVerifier = chatDispatchService.buildPermissionVerifier($scope.library);
    chatPermissionVerifier.uwpApp.hybridRequired = true;
    chatDispatchService.startChat(friendId, chatPermissionVerifier);
    sendEventStream(
      eventStreamService.eventNames.notificationStream.chat,
      notificationId,
      event.type
    );
  };

  $scope.interactNotification = function (notification) {
    if (!notification.isInteracted) {
      notificationStreamService.markInteracted(notification.id).then(function () {
        notification.isInteracted = true;
      });
    }
  };

  $scope.clickCard = function (notification) {
    let url = '';
    let params = {};
    switch (notification.notificationSourceType) {
      case notificationStreamUtility.notificationSourceType.friendRequestReceived:
        $scope.interactNotification(notification);
        if (notification.eventCount > 1 || notification.metadataCollection.length === 0) {
          url = notificationStreamUtility.links.friendRequestLink;
          if ($scope.library.inApp) {
            params = {
              feature: notificationStreamUtility.links.friendRequestTabName,
              urlPath: url
            };
            hybridService.navigateToFeature(params, function (status) {
              $log.debug(`openUserFriendsPage ---- status:${status}`);
            });
          } else {
            window.location.href = urlService.getAbsoluteUrl(url);
          }
        } else if (notification.metadataCollection && notification.metadataCollection.length > 0) {
          var validData = notification.metadataCollection[0];
          url = notificationStreamUtility.links.profileLink;
          const userId = validData.SenderUserId;
          if ($scope.library.inApp) {
            hybridService.openUserProfile(parseInt(userId), function (status) {
              $log.debug(`openUserProfile ---- status:${status}`);
            });
          } else {
            window.location.href = notificationStreamUtility.getAbsoluteUrl(url, { id: userId });
          }
        }

        break;
      case notificationStreamUtility.notificationSourceType.friendRequestAccepted:
        $scope.interactNotification(notification);
        url = notificationStreamUtility.links.friendsLink;
        const count = notification.eventCount ?? notification.metadataCollection?.length;
        sendEventStream(
          notificationStreamConstants.acceptFriendGroupCount,
          notification.id,
          notification.notificationSourceType,
          { count }
        );
        if ($scope.library.inApp) {
          params = {
            feature: notificationStreamUtility.links.friendsTabName,
            urlPath: url
          };
          hybridService.navigateToFeature(params, function (status) {
            $log.debug(`openUserFriendsPage ---- status:${status}`);
          });
        } else {
          window.location.href = urlService.getAbsoluteUrl(url);
        }
        break;
      case notificationStreamUtility.notificationSourceType.privateMessageReceived:
        $scope.interactNotification(notification);
        if (notification.eventCount > 1 || notification.metadataCollection.length === 0) {
          url = notificationStreamUtility.links.inboxLink;
        } else if (notification.metadataCollection && notification.metadataCollection.length > 0) {
          var validData = notification.metadataCollection[0];
          url =
            notificationStreamUtility.links.inboxLink +
            notificationStreamUtility.links.inboxMessageDetailQuery +
            validData.MessageId;
        }

        sendEventStream(
          eventStreamService.eventNames.notificationStream.goToMessages,
          notification.id,
          notification.notificationSourceType,
          { targetUrl: url }
        );

        if ($scope.library.inApp) {
          params = {
            feature: notificationStreamUtility.links.inboxTabName,
            urlPath: url
          };
          hybridService.navigateToFeature(params, function (status) {
            $log.debug(`openUserProfile ---- status:${status}`);
          });
        } else {
          window.location.href = urlService.getAbsoluteUrl(url);
        }
        break;
      case notificationStreamUtility.notificationSourceType.developerMetricsAvailable:
        $scope.interactNotification(notification);
        break;
      case notificationStreamUtility.notificationSourceType.groupJoinRequestAccepted:
        $scope.interactNotification(notification);

        if (notification.metadataCollection.length === 0) {
          url = notificationStreamUtility.links.myGroupsLink;

          sendEventStream(
            eventStreamService.eventNames.notificationStream.goToGroupPage,
            notification.id,
            notification.notificationSourceType,
            { groupId: 0 }
          );

          if ($scope.library.inApp) {
            params = {
              feature: notificationStreamUtility.links.groupsTabName,
              urlPath: url
            };
            hybridService.navigateToFeature(params, function (status) {
              $log.debug(`openGroupDetails ---- status:${status}`);
            });
          } else {
            window.location.href = urlService.getAbsoluteUrl(url);
          }
        } else if (notification.metadataCollection && notification.metadataCollection.length > 0) {
          var validData = notification.metadataCollection[0];
          url = notificationStreamUtility.links.groupLink;
          const groupId = validData.AccepterGroupId;
          params = {
            feature: notificationStreamUtility.links.groupsTabName,
            urlPath: url
          };

          sendEventStream(
            eventStreamService.eventNames.notificationStream.goToGroupPage,
            notification.id,
            notification.notificationSourceType,
            { groupId }
          );

          if ($scope.library.inApp) {
            hybridService.navigateToFeature(params, function (status) {
              $log.debug(`openGroupDetails ---- status:${status}`);
            });
          } else {
            window.location.href = notificationStreamUtility.getAbsoluteUrl(url, { id: groupId });
          }
        }
        break;
      default:
        break;
    }
  };

  $scope.notificationSourceType = notificationStreamUtility.notificationSourceType;

  // Content view manager to support switching between the default
  // notification view and  Game Updates view.
  $scope.contentViewManager = (function () {
    const contentViews = {};
    const manager = {};

    manager.addContentView = function (viewScope) {
      contentViews[viewScope.viewId] = viewScope;
    };

    manager.selectContentView = function (viewId) {
      const activeViewId = this.getCurrentContentViewId ?? '';

      const viewScope = contentViews[viewId];

      if (!viewScope) {
        return;
      }

      angular.forEach(contentViews, function (vScope) {
        vScope.isActive = false;
      });

      viewScope.isActive = true;

      if (activeViewId !== '' && activeViewId !== viewId) {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.pageChanged,
          eventStreamService.context.click,
          {
            targetPage: viewId,
            sendrVersion: 0
          }
        );
      }
    };

    manager.getCurrentContentViewId = function () {
      let activeViewId = '';

      angular.forEach(contentViews, function (vScope, vId) {
        if (vScope.isActive) {
          activeViewId = vId;
        }
      });
      return activeViewId;
    };

    return manager;
  })();

  $document.bind('Roblox.Popover.Status', function (event, args) {
    $log.debug('notificationsController');

    // Go to main content view when notification stream is being opened.
    if (!args.isOpen) {
      $scope.contentViewManager.selectContentView($scope.library.notificationContentViews.main);
    }
  });
}

notificationStreamModule.controller('notificationsController', notificationsController);

export default notificationsController;
