import $ from "jquery";
import { getClient } from "../lib/client";

let domLoggerReady = false;
let domLogger;
let messageQueue = [];
let realTimeClient;
const log = (message, color) => {
  try {
    // eslint-disable-next-line no-console
    if (console && console.log) {
      // eslint-disable-next-line no-console
      console.log(`REALTIME DEBUGGER: ${message}`);
    }
    if (domLoggerReady) {
      const messageColor = color || "black";
      const dt = new Date();
      const time = `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}: `;
      domLogger.append(
        `<div style='color:${messageColor}; margin-bottom:2px; border-bottom:1px solid black; font-size: 11px;'>${time}${message}</div>`,
      );
      domLogger.scrollTop(domLogger[0].scrollHeight);
    } else {
      messageQueue.push(message);
    }
  } catch (e) {
    /* empty */
  }
};

const toggleShowLog = () => {
  domLogger.toggle();
};

const showStatus = isConnected => {
  const color = isConnected ? "green" : "red";
  $("#realtimeDebuggerCheckStatusButton").css("background-color", color);
};

const checkStatus = () => {
  const isConnected = realTimeClient.IsConnected();
  log(`SignalrR Connected:${isConnected}`);
  showStatus(isConnected);
};

const init = () => {
  realTimeClient = getClient();
  realTimeClient.SetLogger(log);
  realTimeClient.SetVerboseLogging(true);

  $(() => {
    let html = "";
    html +=
      "<div id='realtimeDebuggerControlPanel' style=' position: fixed; z-index: 2147483647; background-color: #aaaaaa; right: 24px; top: 24px; opacity: 0.9; '>";
    html += "<button id='realtimeDebuggerCheckStatusButton'>?</button>";
    html += "<button id='realtimeDebuggerToggleLogButton'>+/-</button>";
    html += "</div>";
    html +=
      "<div id='realtimeDebuggerLog' style='display: none; position: fixed; z-index: 2147483647; background-color: #aaaaaa; right: 24px; top: 44px; opacity: 0.9; height: 70%; width: 70%; overflow-y: scroll;'/>";
    $("body").prepend(html);
    domLogger = $("#realtimeDebuggerLog");
    domLoggerReady = true;
    for (const message of messageQueue) {
      log(message);
    }
    messageQueue = [];
    $("#realtimeDebuggerCheckStatusButton").click(checkStatus);
    $("#realtimeDebuggerToggleLogButton").click(toggleShowLog);
    realTimeClient.Subscribe("ChatNotifications", message => {
      log(JSON.stringify(message), "darkblue");
    });
    realTimeClient.SubscribeToConnectionEvents(
      () => {
        log("Connection Event: connected");
        showStatus(true);
      },
      () => {
        log("Connection Event: reconnected");
        showStatus(true);
      },
      () => {
        log("Connection Event: disconnected");
        showStatus(false);
      },
      "ChatNotifications",
    );
    checkStatus();
  });
};

const debuggerInit = init;
export default { debuggerInit };
