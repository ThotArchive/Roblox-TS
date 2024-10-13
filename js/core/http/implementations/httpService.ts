import { AxiosPromise, AxiosResponse, CancelTokenSource } from 'axios';
import httpClient from './httpClient';
import HttpRequestMethods from './httpRequestMethods';
import UrlConfig from '../interfaces/UrlConfig';
import { buildConfigBoundAuthToken } from '../../../utilities/boundAuthTokens/http/boundAuthTokensHttpUtil';

function buildCustomizedConfig(urlConfig: UrlConfig): UrlConfig {
  const config = { ...urlConfig };
  if (urlConfig.noCache) {
    config.headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
      ...config.headers
    };
  }

  if (urlConfig.noPragma && config.headers.Pragma) {
    delete config.headers.Pragma; // this is for backward-compatible, Pragma is deprecated, will remove in the future.
  }

  if (urlConfig.authBearerToken) {
    config.headers = {
      ...config.headers,
      'X-Auth-Bearer-Token': urlConfig.authBearerToken
    };
  }

  return config;
}

function buildRequest(urlConfig: UrlConfig): AxiosPromise {
  if (!urlConfig) {
    Promise.reject(new Error('No config found'));
  }

  return buildConfigBoundAuthToken(urlConfig).then(newConfig => {
    return httpClient(buildCustomizedConfig(newConfig));
  });
}

function buildGetRequest(urlConfig: UrlConfig, params?: URLSearchParams | object): AxiosPromise {
  return buildRequest({
    method: HttpRequestMethods.GET,
    url: urlConfig.url,
    ...urlConfig,
    params
  });
}

function buildPostRequest(
  urlConfig: UrlConfig,
  data?: Document | BodyInit | object | null
): AxiosPromise {
  return buildRequest({
    method: HttpRequestMethods.POST,
    url: urlConfig.url,
    ...urlConfig,
    data
  });
}

function buildPatchRequest(
  urlConfig: UrlConfig,
  data?: Document | BodyInit | object | null
): AxiosPromise {
  return buildRequest({
    method: HttpRequestMethods.PATCH,
    url: urlConfig.url,
    ...urlConfig,
    data
  });
}

function buildPutRequest(urlConfig: UrlConfig, data?: Document | BodyInit | null): AxiosPromise {
  return buildRequest({
    method: HttpRequestMethods.PUT,
    url: urlConfig.url,
    ...urlConfig,
    data
  });
}

function buildDeleteRequest(urlConfig: UrlConfig, params?: URLSearchParams | object): AxiosPromise {
  return buildRequest({
    method: HttpRequestMethods.DELETE,
    url: urlConfig.url,
    ...urlConfig,
    params
  });
}

function buildBatchPromises(
  arrayNeedsBatch: string[],
  cutOff: number,
  urlConfig: UrlConfig,
  isPost: boolean,
  paramsKey: string
): Promise<AxiosResponse[]> {
  const promises: AxiosPromise[] = [];
  let startIndex = 0;
  let subArray = arrayNeedsBatch.slice(startIndex, cutOff);
  const key = paramsKey || 'userIds';
  while (subArray.length > 0) {
    const params: Record<string, string[]> = {};
    params[key] = subArray;
    if (isPost) {
      promises.push(buildPostRequest(urlConfig, params));
    } else {
      promises.push(buildGetRequest(urlConfig, params));
    }
    startIndex += 1;
    subArray = arrayNeedsBatch.slice(startIndex * cutOff, startIndex * cutOff + cutOff);
  }
  return Promise.all(promises);
}

function createCancelToken(): CancelTokenSource {
  return httpClient.CancelToken.source();
}

function isCancelled(error: any): boolean {
  return httpClient.isCancel(error);
}

/**
 * Parses a JavaScript object, which can take on any type, into an array of
 * error codes based on the typical schema returned by our back-end.
 */
const getApiErrorCodes = (error: unknown): number[] => {
  const errorCodes: number[] = [];
  if (!error || typeof error !== 'object') {
    return [];
  }

  const { errors } = error as Record<string, unknown>;
  if (!(errors instanceof Array)) {
    return [];
  }

  errors.forEach((errorObject: unknown) => {
    if (!errorObject || typeof errorObject !== 'object') {
      return;
    }

    const { code } = errorObject as Record<string, unknown>;
    if (typeof code === 'number') {
      errorCodes.push(code);
    }
  });

  return errorCodes;
};

/**
 * Gets a single error code based on a JS object thrown by Axios.
 */
const parseErrorCode = (error: unknown): number | null => {
  const errorCodes = getApiErrorCodes(error);
  if (typeof error === 'object') {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    getApiErrorCodes((error as Record<string, unknown>).data).forEach(item =>
      errorCodes.push(item)
    );
  }

  return errorCodes[0] || null;
};

export default {
  methods: HttpRequestMethods,
  get: buildGetRequest,
  post: buildPostRequest,
  delete: buildDeleteRequest,
  patch: buildPatchRequest,
  put: buildPutRequest,
  buildBatchPromises,
  createCancelToken,
  isCancelled,
  getApiErrorCodes,
  parseErrorCode
};
