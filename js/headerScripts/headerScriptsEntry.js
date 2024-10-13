import {
  jsClientDeviceIdentifier,
  deviceMeta,
  authenticatedUser,
  environmentSites
} from '@rbx/header-scripts';

// keep this for rollout, because we already have two places to use this. Will remove after clean up the usage
window.Roblox.JsClientDeviceIdentifier = jsClientDeviceIdentifier;

window.HeaderScripts = {
  jsClientDeviceIdentifier,
  authenticatedUser,
  environmentSites,
  deviceMeta
};
