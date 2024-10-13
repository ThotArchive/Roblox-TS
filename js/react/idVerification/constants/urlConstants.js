import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, accountSettingsApi, voiceApi } = EnvironmentUrls;

const startPersonaIdVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/start-verification`
});

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

const getVerifiedAgeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/age-verification/verified-age`
});

const getPersonaVerificationStatusUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/verified-status`
});

const getShowOverlayUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${voiceApi}/v1/settings/verify/show-overlay`
});

const getPostOptUserInToVoiceChatUrlConfig = () => ({
  withCredentials: true,
  url: `${voiceApi}/v1/settings/user-opt-in`
});

const getPostOptUserInToAvatarChatUrlConfig = () => ({
  withCredentials: true,
  url: `${voiceApi}/v1/settings/user-opt-in/avatarvideo`
});

const getRecordUserSeenUpsellModalUrlConfig = () => ({
  withCredentials: true,
  url: `${voiceApi}/v1/settings/record-user-seen-upsell-modal`
});

const getRecordUserSeenAvatarVideoUpsellModalUrlConfig = () => ({
  withCredentials: true,
  url: `${voiceApi}/v1/settings/record-user-seen-avatar-video-upsell-modal`
});
export const parentAccountCreationPageUrl = `${EnvironmentUrls.websiteUrl}/parents/account-setup`;

export {
  startPersonaIdVerificationUrlConfig,
  getEmailUrlConfig,
  getEmailVerificationUrlConfig,
  getVerifiedAgeUrlConfig,
  getPersonaVerificationStatusUrlConfig,
  getShowOverlayUrlConfig,
  getPostOptUserInToVoiceChatUrlConfig,
  getPostOptUserInToAvatarChatUrlConfig,
  getRecordUserSeenUpsellModalUrlConfig,
  getRecordUserSeenAvatarVideoUpsellModalUrlConfig
};
