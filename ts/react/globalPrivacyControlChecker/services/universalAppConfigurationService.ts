import { AxiosPromise, httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

export type UserSettingsGlobalPrivacyControlGuacPolicy = {
  // This is a Roblox defined GPC Version, usable to force re-evaluation of globalPrivacyControl if versions do not match.
  gpcVersion: number;
  // Minimum cooldown where GPC will not be sent to backend again until cooldownPeriodInMs + cooldownPeriodFuzzyInMs expired.
  cooldownPeriodInMs: number;
  // Addition to cooldown to prevent every user resuming GPC checks at the same time. Random is used to pick 0.0 to 1.0 of this value to add onto the minimum cooldown.
  cooldownPeriodFuzzyInMs: number;
};

export default {
  getUserSettingsGlobalPrivacyControlGuacPolicy(): AxiosPromise<UserSettingsGlobalPrivacyControlGuacPolicy> {
    const urlConfig = urlConstants.getUserSettingsGlobalPrivacyControlConfig();
    return httpService.get(urlConfig);
  }
};
