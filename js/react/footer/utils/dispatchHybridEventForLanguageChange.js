import { DeviceMeta } from 'Roblox';
import { hybridService } from 'core-roblox-utilities';

function dispatchHybridEventForLanguageChange(localeCode, callback) {
  if (DeviceMeta && hybridService) {
    const deviceMeta = new DeviceMeta();
    const isRobloxApp = deviceMeta.isInApp;
    if (isRobloxApp && hybridService.localization) {
      hybridService.localization(localeCode, callback);
    }
  }
}

export default dispatchHybridEventForLanguageChange;
