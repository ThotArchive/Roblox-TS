import { getClient } from "./lib/client";
import "./lib/signalRConnectionWrapper";
import "./lib/coreSignalRConnectionWrapper";
import "./lib/stateTracker";
import "./vendors/SignalRAbortAsyncPatch-2.2.2";
import "./vendors/jquery.signalR-2.2.2";
import "./constants/events";
import "./constants/options";
import "./sources/crossTabReplicatedSource";
import "./sources/hybridSource";
import "./sources/signalRSource";
import "./debugs/debugger";
import "./debugs/startDebugger";
import "./handlers/authenticationNotificationsHandler";
import factory from "./lib/factory";

export default { GetClient: getClient, ...factory };
