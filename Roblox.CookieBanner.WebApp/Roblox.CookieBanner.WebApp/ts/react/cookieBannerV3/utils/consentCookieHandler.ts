import cookieUtils from './cookieUtils';
import cookieConstants from '../constants/cookieConstants';

const setUserConsent = (acceptCookieNames: string[], nonEssentialCookieList: string[]): void => {
  let consentCookieConfig = '';
  nonEssentialCookieList.forEach((cookie, index) => {
    if (acceptCookieNames.indexOf(cookie) !== -1) {
      consentCookieConfig += `${cookie}=true&`;
    } else {
      consentCookieConfig += `${cookie}=false&`;
    }
    if (index === nonEssentialCookieList.length - 1) {
      consentCookieConfig = consentCookieConfig.slice(0, -1);
    }
  });

  cookieUtils.setCookie(
    cookieConstants.consentCookieName,
    consentCookieConfig,
    cookieConstants.consentExpirationDays
  );
};

export default { setUserConsent };
