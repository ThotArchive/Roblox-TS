import { UrlParser } from 'Roblox';
import { urlService } from 'core-utilities';
import { RETURNURL } from '../constants/browserConstants';
import { widResult } from './tokenUtils';

export const getUrlParamValue = (name: string): string | null => {
  if (!UrlParser) {
    return null;
  }
  const result = UrlParser.getParameterValueByName(name, false);
  return result ? encodeURIComponent(result) : result;
};

export const navigateToPage = (pageUrl: string): void => {
  window.location.href = pageUrl;
};

export const navigateToLogin = (): void => {
  window.location.href = '/login';

  const returnUrl = urlService.getQueryParam(RETURNURL) || '';
  if (returnUrl) {
    window.location.href = `/login?${urlService.composeQueryString({ returnUrl })}`;
  } else {
    window.location.href = '/login';
  }
};

// create signup url with return url param
export const buildSignupRedirUrl = (): string => {
  const returnUrl = urlService.getQueryParam(RETURNURL);
  if (returnUrl) {
    const parsedParams = {
      ReturnUrl: returnUrl
    };
    const signupRedirUrl = urlService.getUrlWithQueries('/account/signupredir', parsedParams);
    return signupRedirUrl;
  }
  return urlService.getAbsoluteUrl('/');
};

export const defaultRedirect = (): void => {
  window.location.href = urlService.getAbsoluteUrl(`/home`);
};

export const VPCRedirect = (): void => {
  const wid = widResult();
  const parentAccountCreationUrl = urlService.getUrlWithQueries(`/parents/account-setup`, {
    wid
  });
  window.location.href = parentAccountCreationUrl;
};
