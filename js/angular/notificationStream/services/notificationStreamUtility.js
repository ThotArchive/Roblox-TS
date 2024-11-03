import { Endpoints, DeviceFeatureDetection, DisplayNames, DeviceMeta } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

function notificationStreamUtility(signalR, layoutLibraryService, $log) {
  'ngInject';

  const { notificationSourceType } = layoutLibraryService;
  const { links } = layoutLibraryService;
  const { stringTemplates } = layoutLibraryService;

  function parseEpochMilliseconds(dateTime) {
    if (!dateTime) {
      return null;
    }

    if (dateTime.getTime) {
      // Input is a javascript Date object.
      return dateTime.getTime();
    }

    if (typeof dateTime === 'string') {
      // Input is a string. Can be of serialized format "Date(123456789)", or a date string "2019-01-17T02:56:31.3146112Z".
      const serializedPattern = /Date\((\d+)\)/;
      const matchResult = serializedPattern.exec(dateTime);

      if (matchResult) {
        return parseInt(matchResult[1]);
      }

      return new Date(dateTime).getTime() || null;
    }

    return null;
  }

  return {
    templates: layoutLibraryService.directiveTemplatesName,
    links,
    textTemplate: layoutLibraryService.textTemplate,

    stringTemplates,

    layout: {
      pageDataInitialized: false,
      firstTimeNotificationStream: false,
      getRecentDataInitialized: false,
      isNotificationContentOpen: false,
      isLazyLoadingRequested: false,
      isGetRecentDataLoadedRequested: true,
      notificationsScrollbarSelector: '#notification-stream-scrollbar',
      settingLink: Endpoints ? Endpoints.getAbsoluteUrl(links.settingLink) : links.settingLink,
      groupLink: Endpoints ? Endpoints.getAbsoluteUrl(links.groupLink) : links.groupLink,
      friendRequestLink: Endpoints
        ? Endpoints.getAbsoluteUrl(links.friendRequestLink)
        : links.friendRequestLink,
      bannerEnabled: false,
      emptyNotificationEnabled: false,
      notificationsLazyLoadingEnabled: false,
      isNotificationsLoading: false,
      isStreamBodyInteracted: false,
      isDisplayNamesEnabled: DisplayNames && DisplayNames.Enabled(),
      bannerText: '',
      errorText: '',
      dataBindSelector: '#notification-stream',
      dataContainerSelector: '#notification-stream-container'
    },

    notificationApiParams: {
      startIndexOfNotifications: 0,
      pageSizeOfNotifications: 20,
      loadMoreNotifications: false
    },

    library: {
      unreadNotifications: 0,
      userIdList: [],
      userLibrary: {},
      prefixLocalStoragekey: 'user_',
      inApp: DeviceMeta ? DeviceMeta().isInApp : false,
      isPhone: DeviceMeta ? DeviceMeta().isPhone : false,
      isTouch: DeviceFeatureDetection ? DeviceFeatureDetection.isTouch : false,
      eventStreamMetaData: {},
      gameUpdateModels: {},
      notificationContentViews: {
        main: 'main',
        gameUpdates: 'gameUpdates'
      },
      canLaunchGameFromGameUpdate: false,
      currentUserId: authenticatedUser.id
    },

    notificationsName: signalR.notifications,
    notificationSourceType,

    signalRType: signalR.types,

    friendRequestReceivedLayout: layoutLibraryService.friendRequestReceivedLayout,

    friendRequestAcceptedLayout: layoutLibraryService.friendRequestAcceptedLayout,

    friendRequestActionType: layoutLibraryService.friendRequestActionType,

    getAbsoluteUrl(link, params) {
      if (Endpoints) {
        return Endpoints.generateAbsoluteUrl(link, params, true);
      }
      return getFormatString(link, params);
    },

    getFormatString(link, params) {
      for (const prop in params) {
        const value = params[prop];
        const regex = new RegExp(`{${prop.toLowerCase()}(:.*?)?\\??}`);
        link = link.replace(regex, value);
      }
      return link;
    },

    isNotificationTypeValid(notificationType) {
      let isMatch = false;
      for (const type in notificationSourceType) {
        if (notificationSourceType[type] === notificationType) {
          isMatch = true;
          break;
        }
      }
      return isMatch;
    },

    isCardClickable(notification) {
      const notificationType = notification.notificationSourceType;
      switch (notificationType) {
        case notificationSourceType.friendRequestAccepted:
          return (
            notification.eventCount > 1 ||
            (notification.eventCount === 1 && notification.metadataCollection.length === 0)
          );
        case notificationSourceType.privateMessageReceived:
        case notificationSourceType.developerMetricsAvailable:
        case notificationSourceType.groupJoinRequestAccepted:
          return true;
      }
      return false;
    },

    normalizeUser(notificationType, userData) {
      const user = {
        userId: null,
        userName: null,
        displayName: null
      };
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          user.userId = userData.SenderUserId;
          user.userName = userData.SenderUserName;
          user.displayName = userData.SenderDisplayName;
          break;
        case notificationSourceType.friendRequestAccepted:
          user.userId = userData.AccepterUserId;
          user.userName = userData.AccepterUserName;
          user.displayName = userData.AccepterDisplayName;
          break;
        case notificationSourceType.privateMessageReceived:
          user.userId = userData.AuthorUserId;
          user.userName = userData.AuthorUserName;
          user.displayName = userData.AuthorDisplayName;
          break;
        case notificationSourceType.developerMetricsAvailable:
        case notificationSourceType.test:
          break;
      }
      return user;
    },

    getUserHtmlTemplate(notificationType, count) {
      let htmlTemplate = '';
      const isDisplayNamesEnabled = DisplayNames && DisplayNames.Enabled();
      switch (notificationType) {
        case notificationSourceType.friendRequestAccepted:
          if (count > 1) {
            htmlTemplate = isDisplayNamesEnabled
              ? stringTemplates.boldDisplayNameLink
              : stringTemplates.boldLink;
          } else {
            htmlTemplate = isDisplayNamesEnabled
              ? stringTemplates.displayNameLink
              : stringTemplates.userLink;
          }
          break;

        case notificationSourceType.friendRequestReceived:
        default:
          htmlTemplate = isDisplayNamesEnabled
            ? stringTemplates.displayNameLink
            : stringTemplates.userLink;
          break;
      }
      return htmlTemplate;
    },

    getGroupHtmlTemplate() {
      return stringTemplates.groupLink;
    },

    normalizeYouHaveText(notificationType, requestCount) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.newFriendRequests(requestCount);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.newFriends(requestCount);
        case notificationSourceType.groupJoinRequestAccepted:
          return layoutLibraryService.newGroups(requestCount);
        default:
          return '';
      }
    },

    normalizeSingleDisplayText(notificationType, targetOne) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.friendRequestSentSingle(targetOne);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.friendRequestAcceptedSingle(targetOne);
        case notificationSourceType.groupJoinRequestAccepted:
          return layoutLibraryService.groupJoinRequestAcceptedSingle(targetOne);
        default:
          return '';
      }
    },

    normalizeSingleConfirmedText(notificationType, userOne) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.confirmSentSingle(userOne);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.confirmAcceptedSingle(userOne);
        default:
          return '';
      }
    },

    normalizeDoubleDisplayText(notificationType, targetOne, targetTwo) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.friendRequestSentDouble(targetOne, targetTwo);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.friendRequestAcceptedDouble(targetOne, targetTwo);
        case notificationSourceType.groupJoinRequestAccepted:
          return layoutLibraryService.groupJoinRequestAcceptedDouble(targetOne, targetTwo);
        default:
          return '';
      }
    },

    normalizeDoubleConfirmedText(notificationType, userOne, userTwo) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.confirmSentDouble(userOne, userTwo);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.confirmAcceptedDouble(userOne, userTwo);
        default:
          return '';
      }
    },

    normalizeMultipleDisplayText(notificationType, targetOne, targetTwo, targetMultipleCount) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.friendRequestSentMultiple(
            targetOne,
            targetTwo,
            targetMultipleCount
          );
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.friendRequestAcceptedMultiple(
            targetOne,
            targetTwo,
            targetMultipleCount
          );
        case notificationSourceType.groupJoinRequestAccepted:
          return layoutLibraryService.groupJoinRequestAcceptedMultiple(
            targetOne,
            targetTwo,
            targetMultipleCount
          );
        default:
          return '';
      }
    },

    normalizeMultipleConfirmedText(notificationType, userOne, userTwo, userMultipleCount) {
      switch (notificationType) {
        case notificationSourceType.friendRequestReceived:
          return layoutLibraryService.confirmSentMultiple(userOne, userTwo, userMultipleCount);
        case notificationSourceType.friendRequestAccepted:
          return layoutLibraryService.confirmAcceptedMultiple(userOne, userTwo, userMultipleCount);
        default:
          return '';
      }
    },

    buildScrollbar(className) {
      const scrollbarElm = angular.element(className);
      scrollbarElm.mCustomScrollbar({
        autoHideScrollbar: false,
        autoExpandScrollbar: false,
        contentTouchScroll: 10000,
        documentTouchScroll: false,
        mouseWheel: {
          preventDefault: true
        },
        advanced: {
          autoScrollOnFocus: false
        }
      });
    },

    isGameUpdateNotification(notificationType) {
      return notificationType === notificationSourceType.gameUpdate;
    },

    isReactNotification(notificationType) {
      return (
        notificationType === notificationSourceType.sendr ||
        notificationType === notificationSourceType.sendrBundle
      );
    },

    parseEpochMilliseconds,

    sortNotificationsByEventDate(notifications, isAscending) {
      if (!notifications) {
        return null;
      }

      const notificationArray = Object.keys(notifications).map(function (k) {
        return notifications[k];
      });

      notificationArray.sort(function (n1, n2) {
        const epoch1 = parseEpochMilliseconds(n1.eventDate) || 0;
        const epoch2 = parseEpochMilliseconds(n2.eventDate) || 0;

        return isAscending ? epoch1 - epoch2 : epoch2 - epoch1;
      });

      return notificationArray;
    }
  };
}

notificationStreamModule.factory('notificationStreamUtility', notificationStreamUtility);

export default notificationStreamUtility;
