import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function chatDispatchService(hybridService, $document, $log) {
  "ngInject";
  return {
    startChat: function (userId, chatPermissionVerifier) {
      const { DeviceMeta } = window.Roblox;
      const deviceType = DeviceMeta && new DeviceMeta();
      if (
        deviceType &&
        deviceType.isAndroidApp &&
        chatPermissionVerifier.androidApp.hybridRequired
      ) {
        var params = { userIds: [] };
        params.userIds.push(userId);
        hybridService.startChatConversation(params);
      } else if (
        deviceType &&
        deviceType.isIosApp &&
        chatPermissionVerifier.iOSApp.hybridRequired
      ) {
        hybridService.startWebChatConversation(userId);
      } else if (
        deviceType &&
        deviceType.isUWPApp &&
        chatPermissionVerifier.uwpApp.hybridRequired
      ) {
        hybridService.startWebChatConversation(userId);
      } else if (
        deviceType &&
        deviceType.isWin32App &&
        chatPermissionVerifier.win32App.hybridRequired
      ) {
        hybridService.startWebChatConversation(userId);
      } else if (
        deviceType &&
        deviceType.isUniversalApp &&
        chatPermissionVerifier.universalApp.hybridRequired
      ) {
        hybridService.startWebChatConversation(userId);
      } else {
        $document.triggerHandler("Roblox.Chat.StartChat", { userId: userId });
      }
    },

    buildPermissionVerifier: function (library) {
      var result = {
        androidApp: {
          isEnabled: library.inAndroidApp,
          hybridRequired: true,
        },
        iOSApp: {
          isEnabled: library.iniOSApp,
          hybridRequired: true,
        },
        uwpApp: {
          isEnabled: library.inUWPApp,
          hybridRequired: false,
        },
        win32App: {
          isEnabled: library.inWin32App,
          hybridRequired: true,
        },
        universalApp: {
          isEnabled: library.inUniversalApp,
          hybridRequired: true,
        },
      };
      return result;
    },
  };
}

angularJsUtilitiesModule.factory("chatDispatchService", chatDispatchService);

export default chatDispatchService;
