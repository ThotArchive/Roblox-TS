import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

// URL configs for ID verification
const startPersonaIdVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/start-verification`
});

async function startPersonaIdVerification() {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true, ageEstimation: true };
  try {
    const { data } = await httpService.post(urlConfig, params);
    return data;
  } catch (err) {
    throw new Error(`Error to start ID verification: ${err || 'unknown'}`);
  }
}

export default startPersonaIdVerification;
