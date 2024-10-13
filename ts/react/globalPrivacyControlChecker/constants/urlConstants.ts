import { EnvironmentUrls } from 'Roblox';

const { userSettingsApi } = EnvironmentUrls;
const { universalAppConfigurationApi } = EnvironmentUrls;
// Used by GUAC; the specific behavior that drives the cooldown period
const behaviorName = 'user-settings-global-privacy-control-policy';

export default {
  setGlobalPrivacyControlConfig: () => {
    return {
      withCredentials: true,
      url: `${userSettingsApi}/v1/user-settings/gpc`
    };
  },
  getUserSettingsGlobalPrivacyControlConfig: () => {
    return {
      withCredentials: true,
      url: `${universalAppConfigurationApi}/v1/behaviors/${behaviorName}/content`
    };
  }
};
