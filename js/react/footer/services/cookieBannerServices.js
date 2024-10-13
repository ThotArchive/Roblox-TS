import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const getCookiePolicy = async () => {
  const urlConfig = urlConstants.getCookiePolicyConfig;
  const response = await httpService.get(urlConfig);
  if (response !== undefined) {
    const cookiePolicy = response.data;
    return cookiePolicy;
  }
  const defaultCookiePolicy = {
    ShouldDisplayCookieBannerV3: false,
    NonEssentialCookieList: [],
    EssentialCookieList: []
  };
  return defaultCookiePolicy;
};

export default { getCookiePolicy };
