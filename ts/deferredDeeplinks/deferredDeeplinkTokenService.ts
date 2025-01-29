import { AxiosResponse, httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { deferredDeeplinkGroupName } from './deferredDeeplinkConstants';

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
    return res.data.token ?? null;
  } catch (err) {
    return null;
  }
};

export default createDeeplinkToken;
