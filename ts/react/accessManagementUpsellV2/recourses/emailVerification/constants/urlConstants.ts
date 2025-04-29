import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, accountSettingsApi, voiceApi } = EnvironmentUrls;

const getEmailUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountSettingsApi}/v1/email`
});

const getEmailVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountSettingsApi}/v1/email/verify`
});

export { getEmailUrlConfig, getEmailVerificationUrlConfig };
