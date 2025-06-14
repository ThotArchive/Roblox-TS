import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function eventStreamService($log) {
  "ngInject";
  function isEventStreamValid() {
    const { EventStream } = window.Roblox;
    return EventStream;
  }
  return {
    targetTypes: isEventStreamValid()
      ? {
          DEFAULT: window.Roblox.EventStream.TargetTypes.DEFAULT,
          WWW: window.Roblox.EventStream.TargetTypes.WWW,
          STUDIO: window.Roblox.EventStream.TargetTypes.STUDIO,
          DIAGNOSTIC: window.Roblox.EventStream.TargetTypes.DIAGNOSTIC,
        }
      : {
          DEFAULT: 0,
          WWW: 1,
          STUDIO: 2,
          DIAGNOSTIC: 3,
        },
    eventNames: {
      global: {
        ajaxPageLoad: "ajaxPageLoad",
        modalAction: "modalAction",
        buttonAction: "buttonAction",
      },
      notificationStream: {
        openFromNewIntro: "nsOpenFromNewIntro",
        openContent: "nsOpenContent",
        openCTA: "nsOpenCTAShown",
        refreshCTA: "nsRefreshCTAShown",
        acceptFriendRequest: "nsAcceptFriendRequest",
        ignoreFriendRequest: "nsIgnoreFriendRequest",
        viewAllFriendRequests: "nsViewAllFriendRequests",
        chat: "nsChat",
        goToProfilePage: "nsGoToProfilePage",
        goToSettingPage: "nsGoToSettingPage",
        launchExperience: "nsLaunchExperience",
        openMetaActions: "nsOpenMetaActions",
        closeMetaActions: "nsCloseMetaActions",
        follow: "nsFollow",
        unfollow: "nsUnfollow",
        report: "nsReport",
        pageChanged: "nsPageChanged",
        goToGameDetails: "nsGoToGameDetails",
        viewDeveloperMetrics: "nsViewDevMetrics",
        goToMessages: "nsGoToMessages",
        goToGroupPage: "nsGoToGroup",
        notificationRetrieved: "nsNotificationRetrieved",
        notificationsBundleCreated: "nsNotificationBundleCreated",
      },
      account: {
        sendVerificationEmail: "sendVerificationEmail",
        addEmail: "addEmail",
        addPhone: "addPhone",
        verifyPhone: "verifyPhone",
        updateTheme: "updateTheme",
      },
    },
    context: {
      seen: "seen",
      click: "click",
      fetched: "fetched",
      inApp: "inApp",
    },
    modalActions: {
      shown: "shown",
      dismissed: "dismissed",
      buttonClicked: "buttonClicked",
    },

    sendEventWithTarget: function (eventName, context, additionalProperties, targetType) {
      const { EventStream } = window.Roblox;
      if (isEventStreamValid() && EventStream.SendEventWithTarget) {
        targetType = targetType ? targetType : this.targetTypes.WWW;
        EventStream.SendEventWithTarget(eventName, context, additionalProperties, targetType);
      }
    },

    // context: where is play button used, such as JoinUser, PrivateServer ..
    sendGamePlayEvent: function (context, placeId, referrerId, joinAttemptId) {
      const { GamePlayEvents } = window.Roblox;
      if (GamePlayEvents && GamePlayEvents.SendGamePlayIntent) {
        GamePlayEvents.SendGamePlayIntent(context, placeId, referrerId, joinAttemptId);
      }
    },

    sendModalShownEvent: function (context, additionalParams) {
      var properties = {
        aType: this.modalActions.shown,
      };
      if (additionalParams) {
        properties = angular.extend(properties, additionalParams);
      }
      this.sendEventWithTarget(this.eventNames.global.modalAction, context, properties);
    },

    sendModalDismissedEvent: function (context, additionalParams) {
      var properties = {
        aType: this.modalActions.dismissed,
      };
      if (additionalParams) {
        properties = angular.extend(properties, additionalParams);
      }
      this.sendEventWithTarget(this.eventNames.global.modalAction, context, properties);
    },

    sendModalEvent: function (context, aType, additionalParams) {
      var properties = {
        aType: aType,
      };
      if (additionalParams) {
        properties = angular.extend(properties, additionalParams);
      }
      this.sendEventWithTarget(this.eventNames.global.modalAction, context, properties);
    },
  };
}

angularJsUtilitiesModule.factory("eventStreamService", eventStreamService);

export default eventStreamService;
