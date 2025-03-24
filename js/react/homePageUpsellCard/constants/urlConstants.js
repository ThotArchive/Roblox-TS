import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, voiceApi } = EnvironmentUrls;

const getUpsellCardTypeUrlConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${apiGatewayUrl}/upsellCard/type`
});

const optUserInToVoiceChatConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${voiceApi}/v1/settings/user-opt-in`
});

const getVoicePolicyConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/universal-app-configuration/v1/behaviors/free-communication-infographics/content`
});

const shouldNotShowAgeEstimationModalUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=ShouldNotShowFaeModalForExperiment`
});

// eslint-disable-next-line import/prefer-default-export
export {
  getUpsellCardTypeUrlConfig,
  getVoicePolicyConfig,
  optUserInToVoiceChatConfig,
  shouldNotShowAgeEstimationModalUrlConfig
};
