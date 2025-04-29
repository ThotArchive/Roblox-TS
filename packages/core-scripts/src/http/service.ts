import axios, { AxiosPromise, AxiosResponse, CancelTokenSource } from "axios";
import "./intercept";
import { UrlConfig, HttpRequestMethods } from "./types";
import { buildConfigBoundAuthToken } from "../auth/boundAuth";

const buildCustomizedConfig = (urlConfig: UrlConfig): UrlConfig => {
  const config = { ...urlConfig };
  if (urlConfig.noCache) {
    config.headers = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: 0,
      ...config.headers,
    };
  }

  if (urlConfig.noPragma && config.headers?.Pragma) {
    delete config.headers.Pragma; // this is for backward-compatible, Pragma is deprecated, will remove in the future.
  }

  if (urlConfig.authBearerToken) {
    config.headers = {
      ...config.headers,
      "X-Auth-Bearer-Token": urlConfig.authBearerToken,
    };
  }

  return config;
};

const buildRequest = <T>(urlConfig: UrlConfig): AxiosPromise<T> => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!urlConfig) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.reject(new Error("No config found"));
  }

  return buildConfigBoundAuthToken(urlConfig).then(newConfig =>
    axios(buildCustomizedConfig(newConfig)),
  );
};

const buildGetRequest = <T>(
  urlConfig: UrlConfig,
  params?: URLSearchParams | object,
): AxiosPromise<T> =>
  buildRequest({
    method: HttpRequestMethods.GET,
    ...urlConfig,
    params,
  });

const buildPostRequest = <T>(
  urlConfig: UrlConfig,
  data?: Document | BodyInit | object | null,
): AxiosPromise<T> =>
  buildRequest({
    method: HttpRequestMethods.POST,
    ...urlConfig,
    data,
  });

const buildPatchRequest = <T>(
  urlConfig: UrlConfig,
  data?: Document | BodyInit | object | null,
): AxiosPromise<T> =>
  buildRequest({
    method: HttpRequestMethods.PATCH,
    ...urlConfig,
    data,
  });

const buildPutRequest = <T>(
  urlConfig: UrlConfig,
  data?: Document | BodyInit | null,
): AxiosPromise<T> =>
  buildRequest({
    method: HttpRequestMethods.PUT,
    ...urlConfig,
    data,
  });

const buildDeleteRequest = <T>(
  urlConfig: UrlConfig,
  params?: URLSearchParams | object,
): AxiosPromise<T> =>
  buildRequest({
    method: HttpRequestMethods.DELETE,
    ...urlConfig,
    params,
  });

const buildBatchPromises = <T>(
  arrayNeedsBatch: string[] | number[],
  cutOff: number,
  urlConfig: UrlConfig,
  isPost: boolean,
  paramsKey: string,
): Promise<AxiosResponse<T>[]> => {
  const promises: AxiosPromise<T>[] = [];
  let startIndex = 0;
  let subArray = arrayNeedsBatch.slice(startIndex, cutOff);
  const key = paramsKey || "userIds";
  while (subArray.length > 0) {
    const params: Record<string, string[] | number[]> = {};
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
};

const createCancelToken = (): CancelTokenSource => axios.CancelToken.source();

const isCancelled = (error: unknown): boolean => axios.isCancel(error);

/**
 * Parses a JavaScript object, which can take on any type, into an array of
 * error codes based on the typical schema returned by our back-end.
 */
const getApiErrorCodes = (error: unknown): number[] => {
  const errorCodes: number[] = [];
  if (!error || typeof error !== "object") {
    return [];
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { errors } = error as Record<string, unknown>;
  if (!(errors instanceof Array)) {
    return [];
  }

  errors.forEach((errorObject: unknown) => {
    if (!errorObject || typeof errorObject !== "object") {
      return;
    }

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const { code } = errorObject as Record<string, unknown>;
    if (typeof code === "number") {
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
  if (typeof error === "object") {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    getApiErrorCodes((error as Record<string, unknown>).data).forEach(item =>
      errorCodes.push(item),
    );
  }

  return errorCodes[0] ?? null;
};

export {
  buildGetRequest as get,
  buildPostRequest as post,
  buildDeleteRequest as delete,
  buildPatchRequest as patch,
  buildPutRequest as put,
  buildBatchPromises,
  createCancelToken,
  isCancelled,
  getApiErrorCodes,
  parseErrorCode,
};
