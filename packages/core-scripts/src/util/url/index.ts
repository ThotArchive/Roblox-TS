import { Brand } from "@rbx/core-types";
import queryString, { ParsedQuery } from "query-string";
import * as endpoints from "../../endpoints";

export const parseUrlAndQueryString = queryString.parseUrl;

export const extractQueryString = queryString.extract;

export const parseQueryString = (searchString = window.location.search): ParsedQuery =>
  queryString.parse(searchString);

export const getQueryParam = (paramName: string): ParsedQuery[""] | undefined =>
  parseQueryString()[paramName];

export const composeQueryString = (queryParams: Record<string, unknown> = {}): string =>
  queryString.stringify(queryParams);

export const getAbsoluteUrl = (targetUrl: string): string => endpoints.getAbsoluteUrl(targetUrl);

export const getGameDetailReferralUrls = (queryParams: Record<string, unknown>): string =>
  getAbsoluteUrl(`/games/refer?${composeQueryString(queryParams)}`);

export const getUrlWithQueries = (path: string, queryParams: Record<string, unknown>): string =>
  getAbsoluteUrl(`${path}?${composeQueryString(queryParams)}`);

export const getUrlWithLocale = (path: string, locale: string): string => {
  if (locale) {
    const queryParams = { locale };
    return getUrlWithQueries(path, queryParams);
  }

  return path;
};

export type ZendeskDeepLinkParams = {
  articleId?: string;
  domain: string;
  locale?: string;
  type?: string;
};

const getHelpDeskLocale = (locale: string): string => {
  // zendesk supported languages https://support.zendesk.com/hc/en-us/articles/4408821324826-Zendesk-language-support-by-product
  const specialCaseLocaleMap: Record<string, string> = {
    "zh-cn": "zh-cn",
    zh_cn: "zh-cn",
    "zh-cjv": "zh-cn",
    zh_cjv: "zh-cn",
    "zh-hans": "zh-cn",
    zh_hans: "zh-cn",
    "zh-tw": "zh-tw",
    zh_tw: "zh-tw",
    "zh-hant": "zh-tw",
    zh_hant: "zh-tw",
    "en-us": "en-us",
    en_us: "en-us",
    en: "en-us",
    "en-gb": "en-gb",
    en_gb: "en-gb",
    "fr-ca": "fr-ca",
    fr_ca: "fr-ca",
    nb: "no",
    "nb-no": "no",
    nb_no: "no",
  };

  if (specialCaseLocaleMap[locale]) {
    return specialCaseLocaleMap[locale];
  }

  const localeArray: string[] = locale.split(/[^a-zA-Z0-9]/).filter(Boolean);

  if (localeArray[0]) {
    return localeArray[0];
  }

  return "en";
};

const isValidLocale = (locale: string): boolean => {
  // valid if alphanumeric and hyphen or underscore
  if (locale) {
    return /^[a-zA-Z0-9-_]+$/.test(locale);
  }
  return false;
};

const isValidHelpDeskArticleId = (articleId?: string): boolean => {
  // valid if alphanumeric
  if (articleId) {
    return /^[a-zA-Z0-9]+$/.test(articleId);
  }
  return false;
};

export const getHelpDeskUrl = (
  locale?: string,
  articleId?: string,
  baseUrlOverride?: string,
): string => {
  let helpDeskUrl = baseUrlOverride ?? "https://en.help.roblox.com/hc/";
  if (locale != null && isValidLocale(locale)) {
    helpDeskUrl += getHelpDeskLocale(locale);
  } else {
    helpDeskUrl += "en-us";
  }

  if (isValidHelpDeskArticleId(articleId)) {
    helpDeskUrl += `/articles/${articleId}`;
  }
  return helpDeskUrl;
};

export type ValidHttpUrl = Brand<string, "ValidUrl">;
export type ValidStripeCheckoutUrl = Brand<string, "ValidStripeCheckoutUrl">;

export const isValidHttpUrl = (urlString: string): urlString is ValidHttpUrl => {
  try {
    const urlObject = new URL(urlString);
    return urlObject.protocol === "http:" || urlObject.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidStripeCheckoutUrl = (urlString: string): urlString is ValidStripeCheckoutUrl =>
  isValidHttpUrl(urlString) && urlString.includes("checkout.stripe.com");

export * from "./url";
