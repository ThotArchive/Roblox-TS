import axios, { AxiosPromise } from 'axios';
import Roblox, { Endpoints, XsrfToken } from 'Roblox';
import {
  apiSiteRequestValidator,
  inject,
  instrumentation,
  isTracerEnabled,
  logs,
  tags,
  tracerConstants
} from 'roblox-tracer';
import requestDuplication from '../../../utilities/requestDuplicationUtilities';
import retryAttemptHeader from '../../../utilities/retryAttemptHeaderUtilities';
import ErrorResponse from '../interfaces/ErrorResponse';
import ResponseConfig from '../interfaces/ResponseConfig';
import UrlConfig from '../interfaces/UrlConfig';
import HttpRequestMethods from './httpRequestMethods';
import HttpResponseCodes from './httpResponseCodes';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_INVALID_RESPONSE_CODE = HttpResponseCodes.forbidden;

// Constants for rendering a generic request challenge.
const GENERIC_CHALLENGE_LOG_PREFIX = 'Generic Challenge:';
const GENERIC_CHALLENGE_ID_HEADER = 'rblx-challenge-id' as const;
const GENERIC_CHALLENGE_TYPE_HEADER = 'rblx-challenge-type' as const;
const GENERIC_CHALLENGE_METADATA_HEADER = 'rblx-challenge-metadata' as const;
const GENERIC_CHALLENGE_CONTAINER_ID = 'generic-challenge-container' as const;
const RETRY_ATTEMPT_HEADER = 'x-retry-attempt' as const;

// TODO: figure out how to get theres from data attr on page #http-retry-dat
const HTTP_RETRY_BASE_TIMEOUT = 1000;
const HTTP_RETRY_MAX_TIMEOUT = 8000;
const HTTP_RETRY_MAX_TIMES = 3;

let currentToken = XsrfToken.getToken();

axios.interceptors.request.use((config: UrlConfig) => {
  const { method, noCache, noPragma, headers, url } = config;
  const newConfig = { ...config };
  // if type is post or delete add XsrfToken to header.
  if (
    method === HttpRequestMethods.POST ||
    method === HttpRequestMethods.PATCH ||
    method === HttpRequestMethods.DELETE
  ) {
    if (!currentToken) {
      currentToken = XsrfToken.getToken();
    }
    if (noCache) {
      newConfig.headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
        ...headers
      };
    }

    if (noPragma && newConfig.headers.Pragma) {
      delete newConfig.headers.Pragma;
    }

    newConfig.headers[CSRF_TOKEN_HEADER] = currentToken;
  }

  // Overwrite Accept-Language header if necessary
  if (Endpoints && Endpoints.supportLocalizedUrls && Endpoints.getAcceptLanguageValue) {
    const acceptLanguageValue = Endpoints.getAcceptLanguageValue(url);
    if (acceptLanguageValue) {
      newConfig.headers['Accept-Language'] = acceptLanguageValue;
    }
  }

  // instrument roblox tracer
  if (isTracerEnabled && apiSiteRequestValidator.isApiSiteAvailableForTracing(url)) {
    const fields = {
      tags: {
        isDuplicate: config.isDuplicate?.toString() || 'false'
      }
    };

    const requestSpan = instrumentation.createAndGetSpan(
      tracerConstants.operationNames.httpRequest,
      fields
    );
    tags.setXHRRequestTags(requestSpan, { component: `axios`, method, url });
    logs.setXHRRequestLogs(requestSpan);
    const headerCarriers = inject.httpRequestCarrier(requestSpan);
    Object.keys(headerCarriers).forEach(key => {
      newConfig.headers[key] = headerCarriers[key];
    });
    newConfig.tracerConfig = {
      requestSpan
    };
  }

  // request duplication
  const shouldDuplicate = requestDuplication.shouldDuplicate(url, config.isDuplicate);
  if (shouldDuplicate) {
    const duplicateConfig = { ...config };
    duplicateConfig.isDuplicate = true;

    const duplicationCount = requestDuplication.getDuplicationCount();
    for (let i = 0; i < duplicationCount; i++) {
      axios.request(duplicateConfig).catch(e => {
        // log error from duplicated request, then swallow it
        console.log(`~~~~ duplicated request failed ~~~~ ${e}`);
      });
    }
  }

  return newConfig;
}, null);

axios.interceptors.response.use(
  (response: ResponseConfig) => {
    const {
      status,
      config: { url, tracerConfig }
    } = response;

    if (tracerConfig && apiSiteRequestValidator.isApiSiteAvailableForTracing(url)) {
      const { requestSpan } = tracerConfig;
      tags.setXHRResponseTags(requestSpan, {
        status
      });
      logs.setXHRResponseSuccessLogs(requestSpan);
      instrumentation.finalizeSpan(requestSpan);
    }
    return response;
  },
  (error: ErrorResponse): AxiosPromise => {
    const { config: responseConfig, response } = error;
    if (response) {
      const { status, headers, config } = response;
      const newToken: string = headers[CSRF_TOKEN_HEADER];

      if (status === CSRF_INVALID_RESPONSE_CODE && newToken) {
        config.headers[CSRF_TOKEN_HEADER] = newToken;
        currentToken = newToken;
        XsrfToken.setToken(newToken);
        return axios.request(config);
      }
      if (retryAttemptHeader.addRetryAttemptHeader()) {
        // Set retry attempt header before all service failure retries.
        let retryAttempt = 1;
        if (config.headers[RETRY_ATTEMPT_HEADER]) {
          retryAttempt = Number(config.headers[RETRY_ATTEMPT_HEADER]) + 1;
        }
        config.headers[RETRY_ATTEMPT_HEADER] = String(retryAttempt);
      }

      if (
        config?.tracerConfig &&
        apiSiteRequestValidator.isApiSiteAvailableForTracing(config.url)
      ) {
        const { requestSpan } = config.tracerConfig;
        tags.setXHRResponseErrorTags(requestSpan, {
          status
        });
        logs.setXHRResponseErrorLogs(requestSpan);
        instrumentation.finalizeSpan(requestSpan);
      }

      // Handle Generic Challenge headers (keep this logic LAST in this handler
      // since it is effectively an extension of application business logic).
      const {
        [GENERIC_CHALLENGE_ID_HEADER]: challengeId,
        [GENERIC_CHALLENGE_TYPE_HEADER]: challengeTypeRaw,
        [GENERIC_CHALLENGE_METADATA_HEADER]: challengeMetadataJsonBase64
      } = headers;
      const anyChallengeHeaderFound =
        challengeId !== undefined ||
        challengeTypeRaw !== undefined ||
        challengeMetadataJsonBase64 !== undefined;
      const challengeAvailable =
        challengeId !== undefined &&
        challengeTypeRaw !== undefined &&
        challengeMetadataJsonBase64 !== undefined;
      if (challengeAvailable) {
        if (Roblox && Roblox.AccountIntegrityChallengeService) {
          return Roblox.AccountIntegrityChallengeService.Generic.interceptChallenge({
            retryRequest: (challengeIdInner, redemptionMetadataJsonBase64) => {
              config.headers[GENERIC_CHALLENGE_ID_HEADER] = challengeIdInner;
              config.headers[GENERIC_CHALLENGE_TYPE_HEADER] = challengeTypeRaw;
              config.headers[GENERIC_CHALLENGE_METADATA_HEADER] = redemptionMetadataJsonBase64;
              return axios.request(config);
            },
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64
          });
        }
        // eslint-disable-next-line no-console
        console.error(
          GENERIC_CHALLENGE_LOG_PREFIX,
          'Got challenge but challenge component not available'
        );
      } else if (anyChallengeHeaderFound) {
        // eslint-disable-next-line no-console
        console.error(GENERIC_CHALLENGE_LOG_PREFIX, 'Got only partial challenge headers');
      }
    }
    if (responseConfig?.fullError || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    return Promise.reject(response);
  }
);

export default axios;
