import eventStreamService from '../eventStreamService/eventStreamService';
import { DeviceMeta, Hybrid } from "Roblox";

const startDesktopAndMobileWebChat = chatProperties => {
  const { userId } = chatProperties;
  if (userId) {
    const deviceType = DeviceMeta && new DeviceMeta();
    if (deviceType && deviceType.isAndroidApp) {
        window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType && deviceType.isIosApp) {
        window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType && deviceType.isUWPApp) {
        window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType && deviceType.isWin32App) {
        window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType && deviceType.isUniversalApp) {
        window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
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
