import eventStreamService from '../eventStreamService/eventStreamService';
import { DeviceMeta, Hybrid } from "Roblox";

const startDesktopAndMobileWebChat = chatProperties => {
  const { userId } = chatProperties;
  if (userId) {
    const deviceType = DeviceMeta && new DeviceMeta();
    if (deviceType && deviceType.isAndroidApp) {
        var params = { userIds: [] };
        params.userIds.push(userId);
        Hybrid.Chat?.startChatConversation(params);
    } else if (deviceType && deviceType.isIosApp) {
        Hybrid.Navigation?.startWebChatConversation(userId);
    } else if (deviceType && deviceType.isUWPApp) {
        Hybrid.Navigation?.startWebChatConversation(userId);
    } else if (deviceType && deviceType.isWin32App) {
        Hybrid.Navigation?.startWebChatConversation(userId);
    } else if (deviceType && deviceType.isUniversalApp) {
        Hybrid.Navigation?.startWebChatConversation(userId);
    } else {
      $(document).triggerHandler("Roblox.Chat.StartChat", { userId });
    }
    eventStreamService.sendEventWithTarget('startChatByUser', 'click', { userId });
  } else {
    console.log('missing valid params to start web chat');
  }
};

export default {
  startDesktopAndMobileWebChat
};
