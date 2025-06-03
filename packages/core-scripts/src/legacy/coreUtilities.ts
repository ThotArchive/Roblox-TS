import { uuidService as coreUuidService } from "@rbx/core";
import * as fmtNumber from "../format/number";
import * as fmtString from "../format/string";
import { createKeyboardEventHandler } from "../util/accessibility";
import BatchRequest from "../util/batch-request/batchRequestFactory";
import * as date from "../util/date";
import * as currentBrowser from "../util/currentBrowser";
import * as http from "../http";
import { PageNames, PageNameProvider } from "../util/pageName";
import * as url from "../util/url";

export const abbreviateNumber = {
  suffixes: fmtNumber.suffixes,
  suffixNames: fmtNumber.SuffixNames,
  getAbbreviatedValue: fmtNumber.abbreviateNumber,
  getTruncValue: fmtNumber.truncNumber,
};
export const accessibility = {
  createKeyboardEventHandler,
};
export { default as BatchRequestFactory } from "../util/batch-request/batchRequestFactory";
export const batchRequestFactory = new BatchRequest(); // deprecated remove after rollout
// export const clipboard = ; // deleted, could not find any references/usages
export const concatTexts = { connectors: fmtString.connectors, concat: fmtString.concat };
export { CursorPager as CoreCursorPager, PagerError, regex, SortOrder } from "@rbx/core";
export { PaginationCache, CursorPager, cursorPaginationConstants } from "../util/cursor-pagination";
export const dateService = {
  addDays: date.addDays,
  addMonths: date.addMonths,
  addYears: date.addYears,
  endOfToday: date.endOfToday,
  getUtcQueryString: date.getUtcQueryString,
  startOfToday: date.startOfToday,
  subDays: date.subDays,
  subMonths: date.subMonths,
  subYears: date.subYears,
};
export { default as defer } from "../util/defer";
// export const downloadFile = ; // deleted, could not find any references/usages
export const escapeHtml = (): ((str: string) => string) => fmtString.escapeHtml;
export const getCurrentBrowser = currentBrowser.currentBrowser;
export const httpRequestMethods = http.HttpRequestMethods;
export const httpResponseCodes = http.HttpResponseCodes;
export const httpService = {
  get: http.get,
  post: http.post,
  delete: http.delete,
  patch: http.patch,
  put: http.put,
  methods: http.HttpRequestMethods,
  isCancelled: http.isCancelled,
  parseErrorCode: http.parseErrorCode,
  getApiErrorCodes: http.getApiErrorCodes,
  buildBatchPromises: http.buildBatchPromises,
  createCancelToken: http.createCancelToken,
};
// export const ListFilterProvider = ; // deleted, could not find any references/usages
export const numberFormat = { getNumberFormat: fmtNumber.formatNumber };
export const pageName = {
  PageNames,
  PageNameProvider,
};
export const quote = { quoteText: (text: string): string => `"${text}"` };
export { default as ready } from "../util/ready";
export const seoName = { formatSeoName: fmtString.formatSeoName };
export const urlService = {
  composeQueryString: url.composeQueryString,
  extractQueryString: url.extractQueryString,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  formatUrl: url.formatUrl,
  getAbsoluteUrl: url.getAbsoluteUrl,
  getGameDetailReferralUrls: url.getGameDetailReferralUrls,
  getHelpDeskUrl: url.getHelpDeskUrl,
  getQueryParam: url.getQueryParam,
  getUrlWithLocale: url.getUrlWithLocale,
  getUrlWithQueries: url.getUrlWithQueries,
  isValidHttpUrl: url.isValidHttpUrl,
  isValidStripeCheckoutUrl: url.isValidStripeCheckoutUrl,
  parseQueryString: url.parseQueryString,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  parseUrl: url.parseUrl,
  parseUrlAndQueryString: url.parseUrlAndQueryString,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  resolveUrl: url.resolveUrl,
};
export const uuidService = {
  generateRandomUuid: coreUuidService.generateRandomUuid,
};
export type { AxiosPromise } from "axios";
