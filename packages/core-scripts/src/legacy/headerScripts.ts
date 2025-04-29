import * as device from "@rbx/core-scripts/meta/device";
import * as environment from "@rbx/core-scripts/meta/environment";
import * as user from "@rbx/core-scripts/meta/user";

export const jsClientDeviceIdentifier = {
  isIE: device.isIE(),
  isIE11: device.isIE11(),
  isIos13Ipad: device.isIos13Ipad(),
  isMac: device.isMac(),
  isWindows: device.isWindows(),
};

export const authenticatedUser = user.authenticatedUser() ?? {
  isAuthenticated: false,
  id: null,
  name: null,
  displayName: null,
  created: null,
  isUnder13: false,
  isPremiumUser: false,
};

export const deviceMeta = {
  AppTypes: device.AppTypes,
  DeviceTypes: device.DeviceTypes,
  getDeviceMeta: device.getDeviceMeta,
};

export const environmentSites = { isTestSite: environment.isTestSite() };
