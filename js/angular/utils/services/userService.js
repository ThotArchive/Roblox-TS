import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { EnvironmentUrls } from "Roblox";

function userService(httpService, urlService) {
    "ngInject";
    var multiGetUserAvatarUrl = "/thumbnail/avatar-headshots";
    var multiGetUserPresenceUrl = EnvironmentUrls.presenceApi + "/v1/presence/users";

    function getUserAvatar(userIds) {
        var url = multiGetUserAvatarUrl;
        var urlConfig = {
            url: urlService.getAbsoluteUrl(url),
            withCredentials: true,
            retryable: true
        }
        var params = {
            userIds: userIds
        }
        return httpService.httpGet(urlConfig, params);
    }

    function getUserPresence(userIds) {
        var url = multiGetUserPresenceUrl;
        var urlConfig = {
            url: urlService.getAbsoluteUrl(url),
            withCredentials: true,
            retryable: true
        }
        var params = {
            userIds: userIds
        }
        return httpService.httpPost(urlConfig, params);
    }

    return {
        getUserAvatar: getUserAvatar,
        getUserPresence: getUserPresence
    }
};

angularJsUtilitiesModule.factory("userService", userService);

export default userService;