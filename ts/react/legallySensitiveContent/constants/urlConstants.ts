import { EnvironmentUrls } from 'Roblox';

const { userSettingsApi } = EnvironmentUrls;

type UrlConfig = {
  retryable: boolean;
  withCredentials: boolean;
  url: string;
};

const getUserSettingsUrlConfig = (): UrlConfig => ({
  retryable: true,
  withCredentials: true,
  url: `${userSettingsApi}/v1/user-settings`
});

export default {
  getUserSettingsUrlConfig
};
