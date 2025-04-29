import $ from "jquery";
import { subscribe, publish, isAvailable } from "./pubSub";

// Do not import anything here without considering if you need to update the rspack.config.js

const namespaceForEvents = "Roblox.CrossTabCommunication.Kingmaker";
const keys = {
  masterId: `${namespaceForEvents}.masterId`,
  electionInProgress: `${namespaceForEvents}.electionInProgress`,
  masterIdRequest: `${namespaceForEvents}.masterIdRequest`,
  masterIdResponse: `${namespaceForEvents}.masterIdResponse`,
  masterLastResponseTime: `${namespaceForEvents}.masterLastResponseTime`,
};

const masterIdRequestValue = "q";
let masterNodeReply = "";
let masterTabId = null;
let isThisTabMaster = false;

let masterNodeMonitorTimer = null;
let masterLastResponseTime = Date.now() - 10000;
const masterIdleTimeBuffer = 2500;
// Whenever the master node is polled, it sets the time it responded into a localstorage key.
// When a new tab comes up, it checks this key and if the last time a master node responded to a query was > X seconds, it declares itself as the master immediately.
const masterLastResponseTimeThreshold = 20000;

const randomNumber = Math.floor(Math.random() * 100 + 1);
const monitorMasterNodeInterval = 2000 + randomNumber;
const waitIntervalForMasterHeartBeat = 1500 + randomNumber;
const electionDuration = 400 + randomNumber;
const electionDetailsPurgeInterval = 500;

// Copied from Stackoverflow.
const generateUUID = () => {
  let d = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const tabId = generateUUID();
const electionListeners = [];
const loggers = [];

const log = message => {
  for (const logger of loggers) {
    try {
      logger(message);
    } catch (e) {
      /* empty */
    }
  }
};

const logMaster = () => {
  log(`Master is: ${masterTabId}`);
};

const timestamp = () => Date.now().toString();

// This callback is raised so that the tabs can know the final result of whether they were chosen as a master or a slave
const announceElectionResults = isMaster => {
  log(`Announcing: Is this tab the master? ${isMaster}`);
  for (const listener of electionListeners) {
    try {
      listener(isMaster);
    } catch (e) {
      log(`Error running subscribed election result handler: ${JSON.stringify(e)}`);
    }
  }
};

const declareThisTabAsMaster = () => {
  log(`Declaring myself as the master ${masterTabId}`);
  masterTabId = tabId;
  isThisTabMaster = true;
  publish(keys.masterId, masterTabId);
  localStorage.removeItem(keys.electionInProgress);
  announceElectionResults(true);

  $(window)
    .unbind(`unload.${namespaceForEvents}`)
    .bind(`unload.${namespaceForEvents}`, () => {
      const masterId = localStorage.getItem(keys.masterId);
      if (masterId && masterId === tabId) {
        // TODO: abdicate
      }
    });
};

const initiateElection = () => {
  // master did not reply. Initiate election
  const electionTime = localStorage.getItem(keys.electionInProgress);
  masterTabId = "";
  if (electionTime) {
    // There is an election in progress. Wait for results
    log("Election already in progress");
    window.setTimeout(() => {
      if (masterTabId.length === 0) {
        declareThisTabAsMaster();
      } else if (masterTabId !== tabId) {
        announceElectionResults(false);
      }
      logMaster();
    }, electionDuration);
  } else {
    log("Election not in progress");
    localStorage.setItem(keys.electionInProgress, timestamp());
    if (masterTabId.length === 0) {
      declareThisTabAsMaster();
    } else if (masterTabId !== tabId) {
      announceElectionResults(false);
    }
    logMaster();
  }
};

const pingMasterAndInitiateElectionIfNotActive = () => {
  log("Checking if Master still active");
  if (isThisTabMaster === true || Date.now() - masterLastResponseTime <= masterIdleTimeBuffer) {
    return;
  }
  masterNodeReply = "";
  publish(keys.masterIdRequest, masterIdRequestValue);
  window.setTimeout(() => {
    if (masterNodeReply.length === 0) {
      if (isThisTabMaster === true || Date.now() - masterLastResponseTime <= masterIdleTimeBuffer) {
        declareThisTabAsMaster();
        return;
      }
      log("Master did not respond. Initiating election");
      initiateElection();
    } else if (masterTabId !== masterNodeReply) {
      announceElectionResults(false); // initiated as a slave
      masterTabId = masterNodeReply;
      logMaster();
    }
  }, waitIntervalForMasterHeartBeat);
};

const monitorMasterNode = () => {
  if (masterNodeMonitorTimer) {
    clearTimeout(masterNodeMonitorTimer);
  }
  masterNodeMonitorTimer = window.setTimeout(() => {
    if (isThisTabMaster === false) {
      pingMasterAndInitiateElectionIfNotActive();
    } else {
      localStorage.setItem(keys.masterLastResponseTime, timestamp());
    }
    monitorMasterNode();
  }, monitorMasterNodeInterval);
};

const subscribeToEvents = () => {
  log("Binding to events");

  subscribe(keys.masterIdRequest, namespaceForEvents, message => {
    if (isThisTabMaster === true && message === masterIdRequestValue) {
      log("Query Received - Confirming Still Master");
      publish(keys.masterIdResponse, tabId);
      localStorage.setItem(keys.masterLastResponseTime, timestamp());
    }
  });

  subscribe(keys.masterId, namespaceForEvents, message => {
    if (message) {
      log("Received Notice Of Master");
      masterLastResponseTime = Date.now();
      masterTabId = message;
      const wasCurrentlyMaster = isThisTabMaster;
      isThisTabMaster = masterTabId === tabId;
      if (isThisTabMaster === false && wasCurrentlyMaster) {
        announceElectionResults(false);
        monitorMasterNode(); // master just responded. Move the monitoring to later
      }
      if (isThisTabMaster === true && !wasCurrentlyMaster) {
        declareThisTabAsMaster();
      }
      localStorage.removeItem(keys.electionInProgress);
      logMaster();
    }
  });

  subscribe(keys.masterIdResponse, namespaceForEvents, message => {
    if (message) {
      log("Master Responded to Query");
      masterLastResponseTime = Date.now();
      masterNodeReply = message;
      monitorMasterNode(); // master just responded. Move the monitoring to later
    } else {
      log("Master Responded to Query - no message");
    }
  });
};

const purgeElectionDetails = () => {
  const electionTime = localStorage.getItem(keys.electionInProgress);
  const lastElectionTimeInMs = parseInt(electionTime, 10);
  if (electionTime && Date.now() - lastElectionTimeInMs > electionDetailsPurgeInterval) {
    localStorage.removeItem(keys.electionInProgress);
  }
  window.setTimeout(purgeElectionDetails, electionDetailsPurgeInterval);
};

const nominateAsEligible = () => {
  // Role assignment
  const masterId = localStorage.getItem(keys.masterId);
  subscribeToEvents();
  const masterLastResponseTimeString = localStorage.getItem(keys.masterLastResponseTime);
  if (!masterLastResponseTimeString || masterLastResponseTimeString.length === 0) {
    masterLastResponseTime = 0;
  } else {
    masterLastResponseTime = parseInt(masterLastResponseTimeString, 10);
  }
  if (masterId) {
    if (masterId === tabId) {
      isThisTabMaster = true;
    } else if (
      masterLastResponseTime > 0 &&
      Date.now() - masterLastResponseTime > masterLastResponseTimeThreshold
    ) {
      // The master node has not responded to pings in a long time. Time to declare this tab as the master!
      initiateElection();
    } else {
      pingMasterAndInitiateElectionIfNotActive();
    }
  } else {
    initiateElection();
  }
  window.setTimeout(() => {
    purgeElectionDetails();
  }, electionDetailsPurgeInterval);
  monitorMasterNode();
};

$(() => {
  if (isAvailable()) {
    nominateAsEligible();
  }
});

export { isAvailable };

export const isMasterTab = () => isThisTabMaster;

export const subscribeToMasterChange = callback => {
  electionListeners.push(callback);
};

export const attachLogger = loggerCallback => {
  loggers.push(loggerCallback);
};
