import $ from "jquery";
// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { parseUrl, formatUrl } from "./util/url/url";

export type AjaxOptions = {
  url: string;
  data: Record<string, string>;
  crossDomain: boolean;
  xhrFields?: {
    withCredentials?: boolean;
  };
};

type jqXHR = {
  setRequestHeader: (headerName: string, value: string) => void;
};

// strips the characters preceding the first '.' in the hostname
// e.g. www.roblox.com -> roblox.com
const rootDomain = window.location.hostname.replace(/^[\w-]+\./, "");
const urls: Record<string, string> = {
  "/game/report-stats": `https://assetgame.${rootDomain}/game/report-stats`,
  "/game/report-event": `https://assetgame.${rootDomain}/game/report-event`,
  "/catalog/html": `https://search.${rootDomain}/catalog/html`,
  "/catalog/json": `https://search.${rootDomain}/catalog/json`,
  "/catalog/contents": `https://search.${rootDomain}/catalog/contents`,
  "/catalog/items": `https://search.${rootDomain}/catalog/items`,
  "/asset-hash-thumbnail/image": `https://assetgame.${rootDomain}/asset-hash-thumbnail/image`,
  "/asset-hash-thumbnail/json": `https://assetgame.${rootDomain}/asset-hash-thumbnail/json`,
  "/asset-thumbnail-3d/json": `https://assetgame.${rootDomain}/asset-thumbnail-3d/json`,
  "/asset-thumbnail/image": `https://assetgame.${rootDomain}/asset-thumbnail/image`,
  "/asset-thumbnail/json": `https://assetgame.${rootDomain}/asset-thumbnail/json`,
  "/asset-thumbnail/url": `https://assetgame.${rootDomain}/asset-thumbnail/url`,
  "/asset/request-thumbnail-fix": `https://assetgame.${rootDomain}/asset/request-thumbnail-fix`,
};
const localizedUrlRegex = /^\/([A-Za-z]{2}(?:-[A-Za-z0-9]{2,3})?)(\/|$)/i;
const firstPartyDomains = [".roblox.com", ".robloxlabs.com", ".roblox.qq.com"];

const metaTag = document.querySelector<HTMLElement>('meta[name="locale-data"]');
let pageUrlLocale: string = metaTag?.dataset.urlLocale ?? "";
let overrideLanguageHeader: boolean = metaTag?.dataset.overrideLanguageHeader === "true";
const supportLocalizedUrls = !!pageUrlLocale;

const isAbsolute = (url: string): boolean => {
  const re = /^([a-z]+:\/\/|\/\/)/;
  return re.test(url);
};

const splitAtQueryString = (url: string): { url: string; query: string } => {
  const regex = /\?(?!})/;
  const result = regex.exec(url);
  if (result === null) {
    return {
      url,
      query: "",
    };
  }
  return {
    url: url.substring(0, result.index),
    query: url.substring(result.index),
  };
};

const isValidLocale = (locale: string): boolean =>
  locale.toLowerCase() !== "my" && locale.toLowerCase() !== "js";

const extractUrlLocaleFromPath = (
  path: string,
): { locale: string | null; remainingPath: string } => {
  let newPath = path;
  // IE doesn't have a leading slash by default
  if (!path.startsWith("/")) {
    newPath = `/${path}`;
  }
  const match = localizedUrlRegex.exec(newPath);

  if (match) {
    const locale = match[1];
    if (locale && isValidLocale(locale)) {
      const remainingPath = newPath.replace(localizedUrlRegex, "/");
      return {
        locale,
        remainingPath,
      };
    }
  }

  return {
    locale: null,
    remainingPath: path,
  };
};

const removeUrlLocale = (url: string): string => {
  let path = url;
  let urlObj;
  if (isAbsolute(url)) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    urlObj = parseUrl(url);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    path = urlObj.pathname!;
  }

  const result = extractUrlLocaleFromPath(path);
  if (!result.locale) {
    return url;
  }

  if (urlObj) {
    urlObj.pathname = result.remainingPath;
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return formatUrl(urlObj);
  }

  return result.remainingPath;
};

const attachUrlLocale = (absoluteUrl: string): string => {
  if (!isAbsolute(absoluteUrl)) {
    return absoluteUrl;
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const urlObj = parseUrl(absoluteUrl);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const result = extractUrlLocaleFromPath(urlObj.pathname!);

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
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return formatUrl(urlObj);
  }

  // Add locale
  urlObj.pathname = `/${pageUrlLocale}${result.remainingPath}`;
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-deprecated
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
  if (!relativeUrl.startsWith("/")) {
    const currentPath = window.location.pathname;
    const currentDirectory = currentPath.slice(0, currentPath.lastIndexOf("/") + 1);
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
  requestData: Record<string, string>,
  isRequestCrossDomain: boolean,
): string => {
  const splitUrl = splitAtQueryString(relativeUrl);
  const relativePath = splitUrl.url.toLowerCase();
  let absoluteUrl = relativePath; // default to keeping the relative path

  // ensure url is absolute
  if (isRequestCrossDomain && typeof urls[relativePath.toLowerCase()] !== typeof undefined) {
    absoluteUrl = getAbsoluteUrl(relativePath);
  }

  if (absoluteUrl.includes("{")) {
    // add in any parameters
    $.each(requestData, (parameter, value) => {
      const regex = new RegExp(`{${parameter.toLowerCase()}(:.*?)?\\??}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      absoluteUrl = absoluteUrl.replace(regex, value);
    });
  }

  return absoluteUrl + splitUrl.query;
};

const isCDN = (url: string): boolean =>
  url.includes("rbxcdn.com") || url.includes("s3.amazonaws.com");

const isFirstPartyDomain = (host: string): boolean =>
  host === window.location.host || firstPartyDomains.some(domain => host.endsWith(domain));

const isThirdPartyUrl = (absoluteUrl: string): boolean => {
  // Treat relative URLs as first party
  if (!isAbsolute(absoluteUrl)) {
    return false;
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const urlObj = parseUrl(absoluteUrl);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const host = urlObj.hostname!;
  if (isFirstPartyDomain(host)) {
    return false;
  }

  return true;
};

const getAcceptLanguageValue = (url: string): string | null => {
  if (overrideLanguageHeader && pageUrlLocale && !isThirdPartyUrl(url)) {
    // ;q=0.01 is an indicator to the backend that this header is not from the browser's language settings
    return `${pageUrlLocale};q=0.01`;
  }

  return null;
};

const ajaxPrefilter = (options: AjaxOptions, _originalOptions: unknown, jqxhr: jqXHR): void => {
  const absoluteUrl = generateAbsoluteUrl(options.url, options.data, options.crossDomain);
  const modifiedOptions = options;
  modifiedOptions.url = absoluteUrl;
  if (!isCDN(options.url)) {
    // as long as we are not requesting something from the CDN or S3,
    // always set crossDomain and withCredentials to true
    modifiedOptions.crossDomain = true;
    modifiedOptions.xhrFields = options.xhrFields ?? {};
    modifiedOptions.xhrFields.withCredentials = true;
  }

  // Automatically attach language header for localized URLs when user is unauthenticated
  const acceptLanguageValue = getAcceptLanguageValue(options.url);
  if (acceptLanguageValue) {
    jqxhr.setRequestHeader("Accept-Language", acceptLanguageValue);
  }
};

const getSeoName = (assetName: string): string => {
  let seoName = assetName;
  if (typeof seoName !== "string") {
    seoName = "";
  }

  return (
    seoName
      .replace(/'/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, "") || "unnamed"
  );
};

const getCatalogItemUrl = (assetId: number, assetName: string): string =>
  getAbsoluteUrl(`/catalog/${assetId}/${getSeoName(assetName)}`);

const getBadgeDetailsUrl = (badgeId: number, badgeName: string): string =>
  getAbsoluteUrl(`/badges/${badgeId}/${getSeoName(badgeName)}`);

const setPageUrlLocale = (urlLocale: string): void => {
  pageUrlLocale = urlLocale;
};

const getPageUrlLocale = (): string => pageUrlLocale;

const getOverrideLanguageHeader = (): boolean => overrideLanguageHeader;

const setOverrideLanguageHeader = (value: boolean): void => {
  overrideLanguageHeader = value;
};

const Urls = urls;
const addCrossDomainOptionsToAllRequests = true;

export {
  ajaxPrefilter,
  getAbsoluteUrl,
  generateAbsoluteUrl,
  getBadgeDetailsUrl,
  getCatalogItemUrl,
  isAbsolute,
  splitAtQueryString,
  removeUrlLocale,
  attachUrlLocale,
  isThirdPartyUrl,
  getPageUrlLocale,
  setPageUrlLocale,
  getOverrideLanguageHeader,
  setOverrideLanguageHeader,
  getAcceptLanguageValue,
  addCrossDomainOptionsToAllRequests,
  supportLocalizedUrls,
  Urls, // Eventually we can get rid of Endpoints.Urls, but existing JS in WWW depends on it.
};
