import url from 'url';
import queryString from 'query-string';
import { Endpoints, Brand } from 'Roblox';

export type TValidHttpUrl = Brand<string, 'ValidUrl'>;
export type TValidStripeCheckoutUrl = Brand<string, 'ValidStripeCheckoutUrl'>;

type TUrl = {
  format: (URL: string | Record<string, any>, options?: Record<string, any>) => string;
  resolve: (URL: string, relativePath: string) => string;
  parse: unknown;
};

const parseQueryString = (searchString = window.location.search): queryString.ParsedQuery<string> =>
  queryString.parse(searchString);

const getQueryParam = (paramName: string): string | string[] | null =>
  parseQueryString()[paramName];

const composeQueryString = (queryParams: Record<string, any> = {}): string =>
  queryString.stringify(queryParams);

const getAbsoluteUrl = (targetUrl: string): string => {
  if (Endpoints) {
    return Endpoints.getAbsoluteUrl(targetUrl);
  }
  return targetUrl;
};

const getGameDetailReferralUrls = (queryParams: Record<string, any>): string => {
  return getAbsoluteUrl(`/games/refer?${composeQueryString(queryParams)}`);
};

const getUrlWithQueries = (path: string, queryParams: Record<string, any>): string => {
  return getAbsoluteUrl(`${path}?${composeQueryString(queryParams)}`);
};

const getUrlWithLocale = (path: string, locale: string): string => {
  if (locale) {
    const queryParams = { locale };
    return getUrlWithQueries(path, queryParams);
  }

  return path;
};

const getHelpDeskBaseUrl = (): string => {
  return 'https://en.help.roblox.com/hc/';
};

const isValidLocale = (locale?: string): boolean => {
  // valid if alphanumeric and hyphen or underscore
  if (locale) {
    return /^[a-zA-Z0-9-_]+$/.test(locale);
  }
  return false;
};

const getHelpDeskLocale = (locale: string): string => {
  // zendesk supported languages https://support.zendesk.com/hc/en-us/articles/4408821324826-Zendesk-language-support-by-product
  const specialCaseLocaleMap: { [key: string]: string } = {
    'zh-cn': 'zh-cn',
    zh_cn: 'zh-cn',
    'zh-cjv': 'zh-cn',
    zh_cjv: 'zh-cn',
    'zh-hans': 'zh-cn',
    zh_hans: 'zh-cn',
    'zh-tw': 'zh-tw',
    zh_tw: 'zh-tw',
    'zh-hant': 'zh-tw',
    zh_hant: 'zh-tw',
    'en-us': 'en-us',
    en_us: 'en-us',
    en: 'en-us',
    'en-gb': 'en-gb',
    en_gb: 'en-gb',
    'fr-ca': 'fr-ca',
    fr_ca: 'fr-ca',
    nb: 'no',
    'nb-no': 'no',
    nb_no: 'no'
  };

  if (specialCaseLocaleMap[locale]) {
    return specialCaseLocaleMap[locale];
  }

  const localeArray: string[] = locale.split(/[^a-zA-Z0-9]/).filter(Boolean);

  if (localeArray[0]) {
    return localeArray[0];
  }

  return 'en';
};

const isValidHelpDeskArticleId = (articleId?: string): boolean => {
  // valid if alphanumeric
  if (articleId) {
    return /^[a-zA-Z0-9]+$/.test(articleId);
  }
  return false;
};

const getHelpDeskUrl = (locale: string, articleId: string, baseUrlOverride?: string): string => {
  let helpDeskUrl = baseUrlOverride || getHelpDeskBaseUrl();
  if (isValidLocale(locale)) {
    helpDeskUrl += getHelpDeskLocale(locale);
  } else {
    helpDeskUrl += 'en-us';
  }

  if (isValidHelpDeskArticleId(articleId)) {
    helpDeskUrl += `/articles/${articleId}`;
  }
  return helpDeskUrl;
};

export const isValidHttpUrl = (urlString: string): urlString is TValidHttpUrl => {
  try {
    const urlObject = new URL(urlString);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

export const isValidStripeCheckoutUrl = (
  urlString: string
): urlString is TValidStripeCheckoutUrl => {
  return isValidHttpUrl(urlString) && urlString.includes('checkout.stripe.com');
};

// Note: Docs for `url` and `querystring` modules can be found on
// url - https://github.com/defunctzombie/node-url
// querystring - https://github.com/sindresorhus/query-string
export default {
  getAbsoluteUrl,
  parseQueryString,
  composeQueryString,
  getQueryParam,
  formatUrl: (url as TUrl).format,
  resolveUrl: (url as TUrl).resolve,
  parseUrl: (url as TUrl).parse,
  parseUrlAndQueryString: queryString.parseUrl,
  extractQueryString: queryString.extract,
  getGameDetailReferralUrls,
  getUrlWithQueries,
  getUrlWithLocale,
  getHelpDeskUrl,
  isValidHttpUrl,
  isValidStripeCheckoutUrl
};
