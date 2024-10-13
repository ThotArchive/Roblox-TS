import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';
import { TCookiePolicy } from '../types/cookiePolicyTypes';

const getCookiePolicy = async (): Promise<TCookiePolicy> => {
  const urlConfig = urlConstants.getCookiePolicyConfig;
  const response = await httpService.get(urlConfig);
  if (response !== undefined) {
    const cookiePolicy: TCookiePolicy = response.data as TCookiePolicy;
    return cookiePolicy;
  }
  const defaultCookiePolicy: TCookiePolicy = {
    ShouldDisplayCookieBannerV3: false,
    NonEssentialCookieList: [],
    EssentialCookieList: []
  };
  return defaultCookiePolicy;
};

export default { getCookiePolicy };
