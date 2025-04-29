import * as E from "fp-ts/Either";
import { UrlConfig } from "../http/types";
import { hbaMeta } from "./hba";
import { getCryptoKeyPair, putCryptoKeyPair } from "./internal/indexedDB";
import { BatGenerationErrorInfo, BatGenerationErrorKind } from "./internal/types";
import { hashStringWithSha256, sign } from "./crypto";
import { sendBATMissingEvent, sendBATSuccessEvent } from "./internal/events";
import { getErrorMessage } from "./internal/errorMessage";

const { CurrentUser, Cookies } = window.Roblox;

const {
  isBoundAuthTokenEnabled,
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  batEventSampleRate: batEventSampleRatePerMillion,
} = hbaMeta();

const SEPARATOR = "|";
const allowedHosts = [".roblox.com", ".robloxlabs.com", ".roblox.qq.com"];

// Explicitly define the properties that different HTTP clients should forward from their config
// objects. Non-standard clients should hopefully break this in an obvious way.
type UrlConfigForBat = Pick<UrlConfig, "url" | "method" | "withCredentials" | "headers" | "data">;

const getHost = (urlStr: string): string => {
  try {
    // URL has been polyfilled for IE
    const loc = new URL(urlStr);
    return loc.hostname;
  } catch {
    return "";
  }
};

// intentionally keep the urlConfig instead of url string as param for browser debugging purpose
const isUrlFromAllowedHost = (urlConfig: UrlConfig): boolean => {
  const host = getHost(urlConfig.url);
  return allowedHosts.some(allowedHost => host.endsWith(allowedHost));
};

let clientCryptoKeyPair: CryptoKeyPair | null = null;

/**
 * Check if a request should attach a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A boolean or error info.
 */
export const shouldRequestWithBoundAuthToken = (
  urlConfig: UrlConfig,
): E.Either<BatGenerationErrorInfo, true> => {
  try {
    if (!CurrentUser) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: "NoCurrentUser" });
    }

    if (!CurrentUser.isAuthenticated) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "CurrentUserNotAuthenticated",
      });
    }

    if (!isUrlFromAllowedHost(urlConfig)) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "UrlNotFromAllowedHost",
      });
    }

    if (!hbaIndexedDBName) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: "EmptyIndexedDbName" });
    }

    if (!hbaIndexedDBObjStoreName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "EmptyIndexedDbObjectStoreName",
      });
    }

    if (!hbaIndexedDBKeyName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "EmptyIndexedDbKeyName",
      });
    }

    if (!isBoundAuthTokenEnabled) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "BoundAuthTokenNotEnabled",
      });
    }

    return E.right(true);
  } catch (e) {
    return E.left({ kind: BatGenerationErrorKind.RequestExemptError, message: getErrorMessage(e) });
  }
};

const updateKeyForCryptoKeyPair = async (): Promise<CryptoKeyPair> => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const browserTrackerId = Cookies?.getBrowserTrackerId() || "";
  let keyPair = await getCryptoKeyPair(
    hbaIndexedDBName,
    hbaIndexedDBObjStoreName,
    browserTrackerId,
  );
  if (keyPair && hbaIndexedDBKeyName) {
    await putCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName,
      keyPair,
    );
    keyPair = await getCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName,
    );
  }
  // @ts-expect-error TODO: old, migrated code
  return keyPair;
};

/**
 * Generate a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A bound auth token or error info.
 */
export const generateBoundAuthToken = async (
  urlConfig: UrlConfigForBat,
): Promise<E.Either<BatGenerationErrorInfo, string>> => {
  try {
    // step 1 get the key pair from indexedDB with key
    if (!clientCryptoKeyPair) {
      try {
        clientCryptoKeyPair = await getCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName,
        );
      } catch (e) {
        // Don't block the request if `getCryptoKeyPair` rejects.
        return E.left({
          message: getErrorMessage(e),
          kind: BatGenerationErrorKind.GetKeyPairFailed,
        });
      }
      try {
        // Only attempt `updateKeyForCryptoKeyPair` if `clientCryptoKeyPair` can't be found via
        // `hbaIndexedDBkeyName`.
        if (!clientCryptoKeyPair) {
          clientCryptoKeyPair = await updateKeyForCryptoKeyPair();
        }
      } catch (e) {
        // Don't block the request if `updateKeyForCryptoKeyPair` rejects.
        return E.left({
          message: getErrorMessage(e),
          kind: BatGenerationErrorKind.UpdateKeyPairFailed,
        });
      }
    }
    // if no key is found, return empty.
    // NOTE: this could be caused by IXP returning false from login/signup upstream
    // while the feature setting is on. BAT will only be available after SAI is enabled and key
    // pairs are generated.
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!clientCryptoKeyPair) {
      return E.left({
        message: "",
        kind: BatGenerationErrorKind.NoKeyPairFound,
      });
    }

    // step 2 get the timeStamp
    const clientEpochTimestamp = Math.floor(Date.now() / 1000).toString();

    // step 3 hash request body
    let strToHash: string;
    if (typeof urlConfig.data === "object") {
      strToHash = JSON.stringify(urlConfig.data);
    } else if (typeof urlConfig.data === "string") {
      strToHash = urlConfig.data;
    }

    let hashedRequestBody = "";
    try {
      // @ts-expect-error TODO: old, migrated code
      hashedRequestBody = await hashStringWithSha256(strToHash);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.RequestBodyHashFailed,
      });
    }

    // step 4 get the request url and method
    const requestUrl = urlConfig.url;
    const requestMethod = (urlConfig.method ?? "").toUpperCase();

    // step 5 payload to sign. The payload components follows the v1 signature schema
    const payloadToSign = [hashedRequestBody, clientEpochTimestamp, requestUrl, requestMethod].join(
      SEPARATOR,
    );

    // step 6 generate BAT signature
    let batSignature = "";
    try {
      batSignature = await sign(clientCryptoKeyPair.privateKey, payloadToSign);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.SignatureFailed,
      });
    }

    const batSignatureVersion = "v1";

    return E.right(
      [batSignatureVersion, hashedRequestBody, clientEpochTimestamp, batSignature].join(SEPARATOR),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("BAT generation error:", e);
    return E.left({
      message: getErrorMessage(e),
      kind: BatGenerationErrorKind.Unknown,
    });
  }
};

/**
 * Build a urlconfig with Bound Auth Token
 *
 * @param {UrlConfig} urlConfig
 * @returns a urlConfig with bound auth token attached in the header
 */
export const buildConfigBoundAuthToken = async (urlConfig: UrlConfigForBat): Promise<UrlConfig> => {
  const shouldRequestTrueOrError = shouldRequestWithBoundAuthToken(urlConfig);
  if (E.isLeft(shouldRequestTrueOrError)) {
    sendBATMissingEvent(urlConfig.url, shouldRequestTrueOrError.left, batEventSampleRatePerMillion);
    return urlConfig;
  }

  // step 1 call generateBoundAuthToken
  const errorOrBatString = await generateBoundAuthToken(urlConfig);

  // step 2 attach it to the header of the request
  const config = { ...urlConfig };
  if (E.isRight(errorOrBatString)) {
    config.headers = {
      ...config.headers,
      "x-bound-auth-token": errorOrBatString.right,
    };
    sendBATSuccessEvent(urlConfig.url, batEventSampleRatePerMillion);
  } else {
    sendBATMissingEvent(urlConfig.url, errorOrBatString.left, batEventSampleRatePerMillion);
  }

  return config;
};
