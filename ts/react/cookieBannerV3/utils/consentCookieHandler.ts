import cookieUtils from './cookieUtils';
import cookieConstants from '../constants/cookieConstants';

const setUserConsent = (acceptCookieNames: string[], nonEssentialCookieList: string[]): void => {
  const currentConsentCookie = cookieUtils.getCookie(cookieConstants.consentCookieName);
  if (currentConsentCookie && currentConsentCookie.length > 0) {
    cookieUtils.deleteCookie(cookieConstants.consentCookieName);
  }
  let consentCookieConfig = '';
  const cookiesToBeDeleted: string[] = [];
  nonEssentialCookieList.forEach((cookie, index) => {
    if (acceptCookieNames.indexOf(cookie) !== -1) {
      consentCookieConfig += `${cookie}=true&`;
    } else {
      consentCookieConfig += `${cookie}=false&`;
      cookiesToBeDeleted.push(cookie);
    }
    if (index === nonEssentialCookieList.length - 1) {
      consentCookieConfig = consentCookieConfig.slice(0, -1);
    }
  });

  cookiesToBeDeleted.forEach(cookie => {
    cookieUtils.deleteCookie(cookie);
  });

  cookieUtils.setCookie(
    cookieConstants.consentCookieName,
    consentCookieConfig,
    cookieConstants.consentExpirationDays
  );
};

const isAnalyticsCookieAccepted = (): boolean => {
  const consentCookie = cookieUtils.getCookie(cookieConstants.consentCookieName);
  if (!consentCookie || consentCookie === '') {
    return false;
  }
  const analyticsCookies = consentCookie.split('&');
  const acceptedAnalyticsCookie = analyticsCookies.find(cookie => {
    const value = cookie.split('=')[1];
    return value === 'true';
  });
  return !!acceptedAnalyticsCookie;
};

export default { setUserConsent, isAnalyticsCookieAccepted };
