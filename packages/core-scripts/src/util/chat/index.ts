import $ from "jquery";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { sendEventWithTarget } from "../../event-stream";

export const startDesktopAndMobileWebChat = ({ userId }: { userId?: number }): void => {
  if (userId) {
    const deviceType = getDeviceMeta();
    if (deviceType?.isAndroidApp) {
      window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType?.isIosApp) {
      window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType?.isUWPApp) {
      window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType?.isWin32App) {
      window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else if (deviceType?.isUniversalApp) {
      window.location.href = `roblox://navigation/chat?userId=${userId}&entryPoint=AppShellWebView`;
    } else {
      $(document).triggerHandler("Roblox.Chat.StartChat", { userId });
    }
    sendEventWithTarget("startChatByUser", "click", { userId });
  } else {
    // eslint-disable-next-line no-console
    console.log("missing valid params to start web chat");
  }
};
