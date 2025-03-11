import { AxiosResponse, httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { deferredDeeplinkGroupName } from './deferredDeeplinkConstants';
import sendDeeplinkTokenCreateAttempt from './deferredDeeplinkEvents';

const deferredDeeplinkTokenServiceUrl = `${EnvironmentUrls.apiGatewayUrl}/deferred-deep-link/token-api`;
export type TCreateDeeplinkTokenResponse = {
  token?: string | null;
  expirationTime: string;
};

const createDeeplinkToken = async (
  experienceAffiliateReferralUrl: string
): Promise<string | null> => {
  const createDeeplinkTokenRequestBody = {
    linkId: experienceAffiliateReferralUrl,
    group: deferredDeeplinkGroupName
  };

  const urlConfig = {
    withCredentials: true,
    url: `${deferredDeeplinkTokenServiceUrl}/create-token`
  };

  try {
    const res: AxiosResponse<TCreateDeeplinkTokenResponse> = await httpService.post(
      urlConfig,
      createDeeplinkTokenRequestBody
    );
    const token = res.data.token ?? null;
    sendDeeplinkTokenCreateAttempt(token, experienceAffiliateReferralUrl, res.status);
    return token;
  } catch (err) {
    return null;
  }
};

export default createDeeplinkToken;
