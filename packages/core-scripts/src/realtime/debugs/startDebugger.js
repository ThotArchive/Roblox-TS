import $ from "jquery";
import realtimeDebugger from "./debugger";

$(() => {
  const { RealTimeSettings } = window.Roblox;
  if (RealTimeSettings && RealTimeSettings.IsDebuggerEnabled === "True") {
    realtimeDebugger.debuggerInit();
  }
});
