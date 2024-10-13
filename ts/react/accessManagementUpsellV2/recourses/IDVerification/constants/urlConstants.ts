import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

// URL configs for ID verification
const startPersonaIdVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/start-verification`
});

const getPersonaVerificationStatusUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/verified-status`
});

const getVerifiedAgeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/age-verification/verified-age`
});
export {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig,
  getVerifiedAgeUrlConfig
};
