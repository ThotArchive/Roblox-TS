export type TDeviceFeatures = {
  cpuCores?: number;
  maxResolution?: string;
  maxMemory?: number;
  networkType?: string;
};

const getMaxResolution = (): string | undefined => {
  if (window?.screen?.width && window?.screen?.height) {
    return `${window.screen.width}x${window.screen.height}`;
  }

  return undefined;
};

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory: number;
};

const isNavigatorWithDeviceMemory = (
  navigator: Navigator
): navigator is NavigatorWithDeviceMemory => {
  return 'deviceMemory' in navigator;
};

const getMaxMemory = (): number | undefined => {
  if (isNavigatorWithDeviceMemory(navigator) && typeof navigator.deviceMemory === 'number') {
    // Convert from GB to MB to match Universal App data
    return navigator.deviceMemory * 1024;
  }

  return undefined;
};

type NavigatorWithConnection = Navigator & {
  connection: {
    effectiveType: string;
  };
};

const isNavigatorWithConnection = (navigator: Navigator): navigator is NavigatorWithConnection => {
  return 'connection' in navigator;
};

const getNetworkType = (): string | undefined => {
  if (isNavigatorWithConnection(navigator) && navigator.connection?.effectiveType) {
    return navigator.connection.effectiveType;
  }

  return undefined;
};

const getDeviceFeatures = (): TDeviceFeatures => {
  try {
    return {
      cpuCores: navigator?.hardwareConcurrency,
      maxResolution: getMaxResolution(),
      maxMemory: getMaxMemory(),
      networkType: getNetworkType()
    };
  } catch {
    return {};
  }
};

export default getDeviceFeatures;
