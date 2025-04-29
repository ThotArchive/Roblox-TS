import {
  interceptChallenge,
  Migrate,
  parseChallengeSpecificProperties,
  renderChallenge,
} from "@rbx/generic-challenges";
import axios, { AxiosPromise } from "axios";
import { getToken, setToken } from "../auth/xsrfToken";
import * as endpoints from "../endpoints";
import {
  apiSiteRequestValidator,
  inject,
  instrumentation,
  isTracerEnabled,
  logs,
  tags,
  tracerConstants,
} from "../tracing";
import {
  ErrorResponse,
  HttpRequestMethods,
  HttpResponseCodes,
  ResponseConfig,
  UrlConfig,
} from "./types";
import { duplicationCount, retryAttemptHeader, shouldDuplicate } from "./util";

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_INVALID_RESPONSE_CODE = HttpResponseCodes.forbidden;

// Constants for rendering a generic request challenge.
const GENERIC_CHALLENGE_LOG_PREFIX = "Generic Challenge:";
const GENERIC_CHALLENGE_ID_HEADER = "rblx-challenge-id";
const GENERIC_CHALLENGE_TYPE_HEADER = "rblx-challenge-type";
const GENERIC_CHALLENGE_METADATA_HEADER = "rblx-challenge-metadata";
const GENERIC_CHALLENGE_CONTAINER_ID = "generic-challenge-container";
const RETRY_ATTEMPT_HEADER = "x-retry-attempt";

// TODO: figure out how to get theres from data attr on page #http-retry-dat
// const HTTP_RETRY_BASE_TIMEOUT = 1000;
// const HTTP_RETRY_MAX_TIMEOUT = 8000;
// const HTTP_RETRY_MAX_TIMES = 3;

let currentToken = getToken();

// @ts-expect-error TODO: old, migrated code
axios.interceptors.request.use((config: UrlConfig) => {
  const { method, noCache, noPragma, headers, url } = config;
  const newConfig = { headers: {}, ...config };
  // if type is post or delete add XsrfToken to header.
  if (
    method === HttpRequestMethods.POST ||
    method === HttpRequestMethods.PATCH ||
    method === HttpRequestMethods.DELETE
  ) {
    if (!currentToken) {
      currentToken = getToken();
    }
    if (noCache) {
      newConfig.headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: 0,
        ...headers,
      };
    }

    if (noPragma && newConfig.headers.Pragma) {
      delete newConfig.headers.Pragma;
    }

    newConfig.headers[CSRF_TOKEN_HEADER] = currentToken;
  }

  // Overwrite Accept-Language header if necessary
  if (endpoints.supportLocalizedUrls) {
    const acceptLanguageValue = endpoints.getAcceptLanguageValue(url);
    if (acceptLanguageValue) {
      newConfig.headers["Accept-Language"] = acceptLanguageValue;
    }
  }

  // instrument roblox tracer
  if (isTracerEnabled && apiSiteRequestValidator.isApiSiteAvailableForTracing(url)) {
    const fields = {
      tags: {
        isDuplicate: config.isDuplicate?.toString() ?? "false",
      },
    };

    const requestSpan = instrumentation.createAndGetSpan(
      tracerConstants.operationNames.httpRequest,
      fields,
    );
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tags.setXHRRequestTags(requestSpan, { component: `axios`, method: method!, url });
    logs.setXHRRequestLogs(requestSpan);
    const headerCarriers = inject.httpRequestCarrier(requestSpan);
    Object.entries(headerCarriers).forEach(([key, val]) => {
      newConfig.headers[key] = val;
    });
    newConfig.tracerConfig = {
      requestSpan,
    };
  }

  // request duplication
  if (shouldDuplicate(url, config.isDuplicate)) {
    const duplicateConfig = { ...config };
    duplicateConfig.isDuplicate = true;

    const count = duplicationCount();
    for (let i = 0; i < count; i += 1) {
      axios.request(duplicateConfig).catch((e: unknown) => {
        // log error from duplicated request, then swallow it
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, no-console
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
      config: { url, tracerConfig },
    } = response;

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (tracerConfig && apiSiteRequestValidator.isApiSiteAvailableForTracing(url!)) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const requestSpan = tracerConfig.requestSpan!;
      tags.setXHRResponseTags(requestSpan, {
        status,
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
      config.headers ??= {};
      const newToken = headers[CSRF_TOKEN_HEADER];

      if (status === CSRF_INVALID_RESPONSE_CODE.valueOf() && newToken) {
        config.headers[CSRF_TOKEN_HEADER] = newToken;
        currentToken = newToken;
        setToken(newToken);
        return axios.request(config);
      }
      if (retryAttemptHeader()) {
        // Set retry attempt header before all service failure retries.
        let retryAttempt = 1;
        if (config.headers[RETRY_ATTEMPT_HEADER]) {
          retryAttempt = Number(config.headers[RETRY_ATTEMPT_HEADER]) + 1;
        }
        config.headers[RETRY_ATTEMPT_HEADER] = String(retryAttempt);
      }

      if (
        config.tracerConfig != null &&
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        apiSiteRequestValidator.isApiSiteAvailableForTracing(config.url!)
      ) {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const requestSpan = config.tracerConfig.requestSpan!;
        tags.setXHRResponseErrorTags(requestSpan, {
          status,
        });
        logs.setXHRResponseErrorLogs(requestSpan);
        instrumentation.finalizeSpan(requestSpan);
      }

      // Handle Generic Challenge headers (keep this logic LAST in this handler
      // since it is effectively an extension of application business logic).
      const {
        [GENERIC_CHALLENGE_ID_HEADER]: challengeId,
        [GENERIC_CHALLENGE_TYPE_HEADER]: challengeTypeRaw,
        [GENERIC_CHALLENGE_METADATA_HEADER]: challengeMetadataJsonBase64,
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
        const retryRequest = (challengeIdInner: string, redemptionMetadataJsonBase64: string) => {
          config.headers ??= {};
          config.headers[GENERIC_CHALLENGE_ID_HEADER] = challengeIdInner;
          config.headers[GENERIC_CHALLENGE_TYPE_HEADER] = challengeTypeRaw;
          config.headers[GENERIC_CHALLENGE_METADATA_HEADER] = redemptionMetadataJsonBase64;
          return axios.request(config);
        };

        // @ts-expect-error TODO: old, migrated code
        const { AccountIntegrityChallengeService } = window.Roblox;

        // Always attempt the new grasshoper-centralized challenge middleware first.
        if (Migrate.isSupportedByGrasshopper(challengeTypeRaw)) {
          return interceptChallenge({
            retryRequest,
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64,
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            legacyGenericRender: AccountIntegrityChallengeService?.Generic.renderChallenge,
          });
        }
        // Or fallback to the globally-bound legacy web challenge middleware.
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (AccountIntegrityChallengeService) {
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          return AccountIntegrityChallengeService.Generic.interceptChallenge({
            retryRequest,
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64,
            newRenderChallenge: renderChallenge,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            newParseChallenge: parseChallengeSpecificProperties,
          });
        }
        // eslint-disable-next-line no-console
        console.error(
          GENERIC_CHALLENGE_LOG_PREFIX,
          "Got challenge but challenge component not available",
        );
      } else if (anyChallengeHeaderFound) {
        // eslint-disable-next-line no-console
        console.error(GENERIC_CHALLENGE_LOG_PREFIX, "Got only partial challenge headers");
      }
    }
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (responseConfig?.fullError || axios.isCancel(error)) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(error);
    }

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(response);
  },
);
