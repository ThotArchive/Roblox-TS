// NOTE(jcountryman, 11/17/22): Future versions of @rbx/core has code
// incompatible with IE11. Please do not bump the version of this package.
// eslint-disable-next-line no-restricted-imports
import {
  regex,
  uuidService,
  PagerError,
  SortOrder,
  CursorPager as CoreCursorPager
} from '@rbx/core';
import accessibility from './utils/accessibility/accessibility';
import batchRequestFactory, {
  BatchRequestFactory
} from './services/batchRequestService/batchRequestFactory';

import clipboard from './utils/clipboard/clipboard';
import cursorPaginationConstants from './cursorPagination/cursorPaginationConstants';
import CursorPager from './cursorPagination/CursorPager';
import dateService from './services/dateService';
import defer from './utils/deferred';
import { getCurrentBrowser } from './utils/getCurrentBrowser';
import downloadFile from './utils/downloadFile';
import { httpRequestMethods, httpResponseCodes, httpService } from './http/http';
import ListFilterProvider from './utils/ListFilterProvider';
import PaginationCache from './cursorPagination/PaginationCache';
import pageName from './pageNames/pageNameProvider';
import ready from './utils/ready';
import urlService from './services/urlService';
import abbreviateNumber from './utils/abbreviate/abbreviateNumber';
import quote from './utils/textFormat/quote';
import concatTexts from './utils/textFormat/concatTexts';
import numberFormat from './utils/numberFormat/numberFormat';
import seoName from './utils/seo/seoName';
import escapeHtml from './utils/escapeHtml';
import endpoints from './utils/endpoints';

// Side-effect only import (singleton interceptor that applies bound auth tokens to all jQuery
// requests). The React (and general purpose) version of this interceptor is attached to the
// exported `httpService` and the Angular  version of this interceptor lives with the
// `angularJsUtilities` bundle.
import './utils/jquery/boundAuthTokenHeaderInjector';

window.CoreUtilities = {
  abbreviateNumber,
  accessibility,
  BatchRequestFactory,
  batchRequestFactory, // deprecated remove after rollout
  clipboard,
  concatTexts,
  CoreCursorPager,
  CursorPager,
  cursorPaginationConstants,
  dateService,
  defer,
  downloadFile,
  escapeHtml,
  getCurrentBrowser,
  httpRequestMethods,
  httpResponseCodes,
  httpService,
  ListFilterProvider,
  numberFormat,
  pageName,
  PagerError,
  PaginationCache,
  quote,
  ready,
  regex,
  seoName,
  SortOrder,
  urlService,
  uuidService
};

window.Roblox = window.Roblox || {};
window.Roblox.Endpoints = endpoints;
