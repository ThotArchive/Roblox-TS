import { parse, format } from 'url';

type UrlObj = {
  href: string;
  hostname: string;
  pathname: string;
};

const parseUrl = (url: string): UrlObj => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return parse(url);
};

const formatUrl = (urlObj: UrlObj): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return format(urlObj);
};

type AjaxOptions = {
  url: string;
  data: {};
  crossDomain: boolean;
  xhrFields: {
    withCredentials?: boolean;
  };
};

type jqXHR = {
  setRequestHeader: (headerName: string, value: any) => void;
};

// strips the characters preceding the first '.' in the hostname
// e.g. www.roblox.com -> roblox.com
const rootDomain = window.location.hostname.replace(/^[\w-]+\./, '');
const urls: { [url: string]: string } = {
  '/game/report-stats': `https://assetgame.${rootDomain}/game/report-stats`,
  '/game/report-event': `https://assetgame.${rootDomain}/game/report-event`,
  '/catalog/html': `https://search.${rootDomain}/catalog/html`,
  '/catalog/json': `https://search.${rootDomain}/catalog/json`,
  '/catalog/contents': `https://search.${rootDomain}/catalog/contents`,
  '/catalog/items': `https://search.${rootDomain}/catalog/items`,
  '/asset-hash-thumbnail/image': `https://assetgame.${rootDomain}/asset-hash-thumbnail/image`,
  '/asset-hash-thumbnail/json': `https://assetgame.${rootDomain}/asset-hash-thumbnail/json`,
  '/asset-thumbnail-3d/json': `https://assetgame.${rootDomain}/asset-thumbnail-3d/json`,
  '/asset-thumbnail/image': `https://assetgame.${rootDomain}/asset-thumbnail/image`,
  '/asset-thumbnail/json': `https://assetgame.${rootDomain}/asset-thumbnail/json`,
  '/asset-thumbnail/url': `https://assetgame.${rootDomain}/asset-thumbnail/url`,
  '/asset/request-thumbnail-fix': `https://assetgame.${rootDomain}/asset/request-thumbnail-fix`
};
const localizedUrlRegex = /^\/([A-Za-z]{2}(?:-[A-Za-z0-9]{2,3})?)(\/|$)/i;
const firstPartyDomains = ['.roblox.com', '.robloxlabs.com', '.roblox.qq.com'];

const metaTag = document.querySelector<HTMLElement>('meta[name="locale-data"]');
let pageUrlLocale: string = metaTag?.dataset?.urlLocale ?? '';
let overrideLanguageHeader: boolean = metaTag?.dataset?.overrideLanguageHeader === 'true';
const supportLocalizedUrls = !!pageUrlLocale;

const isAbsolute = (url: string): boolean => {
  const re = new RegExp('^([a-z]+://|//)');
  return re.test(url);
};

const splitAtQueryString = (url: string): { url: string; query: string } => {
  const regex = new RegExp('\\?(?!})');
  const result = regex.exec(url);
  if (result === null) {
    return {
      url,
      query: ''
    };
  }
  return {
    url: url.substring(0, result.index),
    query: url.substring(result.index)
  };
};

const isValidLocale = (locale: string): boolean => {
  return locale.toLowerCase() !== 'my' && locale.toLowerCase() !== 'js';
};

const extractUrlLocaleFromPath = (path: string): { locale: string; remainingPath: string } => {
  let newPath = path;
  // IE doesn't have a leading slash by default
  if (!path.startsWith('/')) {
    newPath = `/${path}`;
  }
  const match = localizedUrlRegex.exec(newPath);

  if (match) {
    const locale = match[1];
    if (isValidLocale(locale)) {
      const remainingPath = newPath.replace(localizedUrlRegex, '/');
      return {
        locale,
        remainingPath
      };
    }
  }

  return {
    locale: null,
    remainingPath: path
  };
};

const removeUrlLocale = (url: string): string => {
  let path = url;
  let urlObj: UrlObj = null;
  if (isAbsolute(url)) {
    urlObj = parseUrl(url);
    path = urlObj.pathname;
  }

  const result = extractUrlLocaleFromPath(path);
  if (!result.locale) {
    return url;
  }

  if (urlObj) {
    urlObj.pathname = result.remainingPath;
    return formatUrl(urlObj);
  }

  return result.remainingPath;
};

const attachUrlLocale = (absoluteUrl: string): string => {
  if (!isAbsolute(absoluteUrl)) {
    return absoluteUrl;
  }

  const urlObj = parseUrl(absoluteUrl);
  const result = extractUrlLocaleFromPath(urlObj.pathname);

  // No changes required
  if (pageUrlLocale === result.locale) {
    return absoluteUrl;
  }

  // Only add to website URLs
  if (urlObj.hostname !== window.location.hostname) {
    return absoluteUrl;
  }

  if (!pageUrlLocale) {
    // Remove locale since current page doesn't have one
    urlObj.pathname = result.remainingPath;
    return formatUrl(urlObj);
  }

  // Add locale
  urlObj.pathname = `/${pageUrlLocale}${result.remainingPath}`;
  return formatUrl(urlObj);
};

const getAbsoluteUrl = (relativeUrl: string): string => {
  // if JavascriptEndpointsEnabled setting is false, don't do anything
  if (typeof urls === typeof undefined) {
    return relativeUrl;
  }

  if (relativeUrl.length === 0) {
    return relativeUrl;
  }

  if (isAbsolute(relativeUrl)) {
    return attachUrlLocale(relativeUrl);
  }

  // if relativeUrl does not begin with a /, home it to current directory
  let modifiedRelativeUrl = relativeUrl;
  if (relativeUrl.indexOf('/') !== 0) {
    const currentPath = window.location.pathname;
    const currentDirectory = currentPath.slice(0, currentPath.lastIndexOf('/') + 1);
    modifiedRelativeUrl = currentDirectory + relativeUrl;
  }

  let absoluteUrl = urls[modifiedRelativeUrl.toLowerCase()];
  if (absoluteUrl === undefined) {
    const defaultDomain = `${window.location.protocol}//${window.location.hostname}`;
    absoluteUrl = defaultDomain + modifiedRelativeUrl;
  }

  absoluteUrl = attachUrlLocale(absoluteUrl);

  return absoluteUrl;
};

const generateAbsoluteUrl = (
  relativeUrl: string,
  requestData: {},
  isRequestCrossDomain: boolean
): string => {
  const splitUrl = splitAtQueryString(relativeUrl);
  const relativePath = splitUrl.url.toLowerCase();
  let absoluteUrl = relativePath; // default to keeping the relative path

  // ensure url is absolute
  if (isRequestCrossDomain && typeof urls[relativePath.toLowerCase()] !== typeof undefined) {
    absoluteUrl = getAbsoluteUrl(relativePath);
  }

  if (absoluteUrl.indexOf('{') > -1) {
    // add in any parameters
    $.each(requestData, (parameter, value) => {
      const regex = new RegExp(`{${parameter.toLowerCase()}(:.*?)?\\??}`);
      absoluteUrl = absoluteUrl.replace(regex, value);
    });
  }

  return absoluteUrl + splitUrl.query;
};

const isCDN = (url: string): boolean => {
  return url.indexOf('rbxcdn.com') > -1 || url.indexOf('s3.amazonaws.com') > -1;
};

const isFirstPartyDomain = (host: string): boolean => {
  if (host === window.location.host) {
    return true;
  }

  for (let i = 0; i < firstPartyDomains.length; i++) {
    if (host.endsWith(firstPartyDomains[i])) {
      return true;
    }
  }
  return false;
};

const isThirdPartyUrl = (absoluteUrl: string): boolean => {
  // Treat relative URLs as first party
  if (!isAbsolute(absoluteUrl)) {
    return false;
  }

  const urlObj = parseUrl(absoluteUrl);
  const host = urlObj.hostname;
  if (isFirstPartyDomain(host)) {
    return false;
  }

  return true;
};

const getAcceptLanguageValue = (url: string): string => {
  if (overrideLanguageHeader && pageUrlLocale && !isThirdPartyUrl(url)) {
    // ;q=0.01 is an indicator to the backend that this header is not from the browser's language settings
    return `${pageUrlLocale};q=0.01`;
  }

  return null;
};

const ajaxPrefilter = (options: AjaxOptions, originalOptions: AjaxOptions, jqxhr: jqXHR) => {
  const absoluteUrl = generateAbsoluteUrl(options.url, options.data, options.crossDomain);
  const modifiedOptions = options;
  modifiedOptions.url = absoluteUrl;
  if (!isCDN(options.url)) {
    // as long as we are not requesting something from the CDN or S3,
    // always set crossDomain and withCredentials to true
    modifiedOptions.crossDomain = true;
    modifiedOptions.xhrFields = options.xhrFields || {};
    modifiedOptions.xhrFields.withCredentials = true;
  }

  // Automatically attach language header for localized URLs when user is unauthenticated
  const acceptLanguageValue = getAcceptLanguageValue(options.url);
  if (acceptLanguageValue) {
    jqxhr.setRequestHeader('Accept-Language', acceptLanguageValue);
  }
};

const getSeoName = (assetName: string): string => {
  let seoName = assetName;
  if (typeof seoName !== 'string') {
    seoName = '';
  }

  return (
    seoName
      .replace(/'/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, '') || 'unnamed'
  );
};

const getCatalogItemUrl = (assetId: number, assetName: string): string => {
  return getAbsoluteUrl(`/catalog/${assetId}/${getSeoName(assetName)}`);
};

const getBadgeDetailsUrl = (badgeId: number, badgeName: string): string => {
  return getAbsoluteUrl(`/badges/${badgeId}/${getSeoName(badgeName)}`);
};

const setPageUrlLocale = (urlLocale: string): void => {
  pageUrlLocale = urlLocale;
};

const getPageUrlLocale = (): string => {
  return pageUrlLocale;
};

const getOverrideLanguageHeader = (): boolean => {
  return overrideLanguageHeader;
};

const setOverrideLanguageHeader = (value: boolean): void => {
  overrideLanguageHeader = value;
};

$.ajaxPrefilter(ajaxPrefilter);

const addLocalePrefixToAnchorTag = (a: HTMLAnchorElement): void => {
  // Only match same site links
  if (a.hostname === window.location.hostname) {
    const oldHref = a.href;
    const newHref = attachUrlLocale(oldHref);
    if (newHref !== oldHref) {
      // eslint-disable-next-line no-param-reassign
      a.href = newHref;
    }
  }
};

const localizeAllLinks = () => {
  const allLinks = document.links;
  for (let i = 0; i < allLinks.length; i++) {
    const a = allLinks[i] as HTMLAnchorElement;
    addLocalePrefixToAnchorTag(a);
  }
};

const rewriteDynamicLinksOnClick = () => {
  // Don't turn into arrow function, it changes the behavior of 'this'
  $('body').on('click', 'a', function onClick() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-this-alias
    const a: HTMLAnchorElement = this;
    addLocalePrefixToAnchorTag(a);
  });
};

if (supportLocalizedUrls) {
  $(document).ready(() => {
    localizeAllLinks();
    rewriteDynamicLinksOnClick();
  });
}

export default {
  getAbsoluteUrl,
  generateAbsoluteUrl,
  getBadgeDetailsUrl,
  getCatalogItemUrl,
  isAbsolute,
  splitAtQueryString,
  ajaxPrefilter,
  removeUrlLocale,
  attachUrlLocale,
  isThirdPartyUrl,
  getPageUrlLocale,
  setPageUrlLocale,
  getOverrideLanguageHeader,
  setOverrideLanguageHeader,
  getAcceptLanguageValue,
  addCrossDomainOptionsToAllRequests: true,
  supportLocalizedUrls,
  Urls: urls // Eventually we can get rid of Endpoints.Urls, but existing JS in WWW depends on it.
};
