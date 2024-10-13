import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { RealTime } from "Roblox";

function realtimeService($log) {
    "ngInject";
    var realTimeTypes = {
        friendshipNotifications: "FriendshipNotifications",
        presenceNotifications: "PresenceNotifications",
        gameCloseNotifications: "GameCloseNotifications",
        userThemeTypeChangeNotification: "UserThemeTypeChangeNotification"
    }

    var notificationTypes = {
        friendshipNotifications: {
            friendshipDestroyed: "FriendshipDestroyed",
            friendshipCreated: "FriendshipCreated",
            friendshipDeclined: "FriendshipDeclined",
            friendshipRequested: "FriendshipRequested"
        },
        presenceNotifications: {
            presenceOffline: "UserOffline",
            presenceOnline: "UserOnline"
        },
        gameCloseNotifications: {
            close: "Close"
        },
        userThemeTypeChangeNotification: {
            themeUpdate: "ThemeUpdate"
        }
    }

    function isRealTimeValid() {
        return RealTime;
    }

    function getRealTimeClient() {
        if (isRealTimeValid()) {
            return RealTime.Factory.GetClient();
        }
        return null;
    }

    function listenToNotification(notificationType, callbacks) {
        if (isRealTimeValid() && angular.isDefined(callbacks)) {
            var realTimeClient = this.getRealTimeClient();
            realTimeClient.Subscribe(notificationType, function (data) {
                $log.debug("--------- this is " + notificationType+" subscription -----------" + data.Type);
                if (data && data.Type && callbacks[data.Type]) {
                    callbacks[data.Type](data);
                }
            });
        }
    }

    return {
        realTimeTypes: realTimeTypes,
        notificationTypes: notificationTypes,
        isRealTimeValid: isRealTimeValid,
        getRealTimeClient: getRealTimeClient,
        listenToNotification: listenToNotification
    }
};

angularJsUtilitiesModule.factory("realtimeService", realtimeService);

export default realtimeService;