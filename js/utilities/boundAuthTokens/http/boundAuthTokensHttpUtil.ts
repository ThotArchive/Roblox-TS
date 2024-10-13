import { Cookies, CurrentUser } from 'Roblox';
import * as E from 'fp-ts/Either';
import UrlConfig from '../../../core/http/interfaces/UrlConfig';
import { getHbaMeta } from '../constants/hbaMeta';
import cryptoUtil from '../crypto/cryptoUtil';
import { getCryptoKeyPair, putCryptoKeyPair } from '../store/indexedDB';
import { BatGenerationErrorInfo, BatGenerationErrorKind } from '../types/hbaTypes';
import { sendBATMissingEvent, sendBATSuccessEvent } from '../utils/eventUtil';
import { getErrorMessage } from './errorUtil';

const SEPARATOR = '|';
const allowedHosts = ['.roblox.com', '.robloxlabs.com', '.roblox.qq.com'];

let clientCryptoKeyPair: CryptoKeyPair;

// Explicitly define the properties that different HTTP clients should forward from their config
// objects. Non-standard clients should hopefully break this in an obvious way.
type UrlConfigForBat = Pick<UrlConfig, 'url' | 'method' | 'withCredentials' | 'headers' | 'data'>;

const hbaMeta = getHbaMeta();

const {
  isBoundAuthTokenEnabled,
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  batEventSampleRate: batEventSampleRatePerMillion
} = hbaMeta;

const getHost = (urlStr: string): string => {
  try {
    // URL has been polyfilled for IE
    const loc = new URL(urlStr);
    return loc.hostname;
  } catch (e) {
    return '';
  }
};
// intentionally keep the urlConfig instead of url string as param for browser debugging purpose
const isUrlFromAllowedHost = (urlConfig: UrlConfig): boolean => {
  for (let i = 0; i < allowedHosts.length; i++) {
    if (getHost(urlConfig.url).endsWith(allowedHosts[i])) {
      return true;
    }
  }
  return false;
};

/**
 * Check if a request should attach a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A boolean or error info.
 */
export function shouldRequestWithBoundAuthToken(
  urlConfig: UrlConfig
): E.Either<BatGenerationErrorInfo, true> {
  try {
    if (!CurrentUser) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: 'NoCurrentUser' });
    }

    if (!CurrentUser?.isAuthenticated) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: 'CurrentUserNotAuthenticated'
      });
    }

    if (!isUrlFromAllowedHost(urlConfig)) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: 'UrlNotFromAllowedHost'
      });
    }

    if (!hbaIndexedDBName) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: 'EmptyIndexedDbName' });
    }

    if (!hbaIndexedDBObjStoreName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: 'EmptyIndexedDbObjectStoreName'
      });
    }

    if (!hbaIndexedDBKeyName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: 'EmptyIndexedDbKeyName'
      });
    }

    if (!isBoundAuthTokenEnabled) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: 'BoundAuthTokenNotEnabled'
      });
    }

    return E.right(true);
  } catch (e) {
    return E.left({ kind: BatGenerationErrorKind.RequestExemptError, message: getErrorMessage(e) });
  }
}

async function updateKeyForCryptoKeyPair(): Promise<CryptoKeyPair> {
  const browserTrackerId = Cookies?.getBrowserTrackerId() || '';
  let keyPair = await getCryptoKeyPair(
    hbaIndexedDBName,
    hbaIndexedDBObjStoreName,
    browserTrackerId
  );
  if (keyPair && hbaIndexedDBKeyName) {
    await putCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName,
      keyPair
    );
    keyPair = await getCryptoKeyPair(
      hbaIndexedDBName,
      hbaIndexedDBObjStoreName,
      hbaIndexedDBKeyName
    );
  }
  return keyPair;
}

/**
 * Generate a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A bound auth token or error info.
 */
export async function generateBoundAuthToken(
  urlConfig: UrlConfigForBat
): Promise<E.Either<BatGenerationErrorInfo, string>> {
  try {
    // step 1 get the key pair from indexedDB with key
    if (!clientCryptoKeyPair) {
      try {
        clientCryptoKeyPair = await getCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName
        );
      } catch (e) {
        // Don't block the request if `getCryptoKeyPair` rejects.
        return E.left({
          message: getErrorMessage(e),
          kind: BatGenerationErrorKind.GetKeyPairFailed
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
          kind: BatGenerationErrorKind.UpdateKeyPairFailed
        });
      }
    }
    // if no key is found, return empty.
    // NOTE: this could be caused by IXP returning false from login/signup upstream
    // while the feature setting is on. BAT will only be available after SAI is enabled and key pairs are generated.
    if (!clientCryptoKeyPair) {
      return E.left({
        message: '',
        kind: BatGenerationErrorKind.NoKeyPairFound
      });
    }

    // step 2 get the timeStamp
    const clientEpochTimestamp = Math.floor(Date.now() / 1000).toString();

    // step 3 hash request body
    let strToHash;
    if (typeof urlConfig.data === 'object') {
      strToHash = JSON.stringify(urlConfig.data);
    } else if (typeof urlConfig.data === 'string') {
      strToHash = urlConfig.data;
    }

    let hashedRequestBody = '';
    try {
      hashedRequestBody = await cryptoUtil.hashStringWithSha256(strToHash);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.RequestBodyHashFailed
      });
    }

    // step 4 payload to sign
    const payloadToSign = [hashedRequestBody, clientEpochTimestamp].join(SEPARATOR);

    // step 5 generate BAT signature
    let batSignature = '';
    try {
      batSignature = await cryptoUtil.sign(clientCryptoKeyPair.privateKey, payloadToSign);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.SignatureFailed
      });
    }

    return E.right([hashedRequestBody, clientEpochTimestamp, batSignature].join(SEPARATOR));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('BAT generation error:', e);
    return E.left({
      message: getErrorMessage(e),
      kind: BatGenerationErrorKind.Unknown
    });
  }
}

/**
 * Build a urlconfig with Bound Auth Token
 *
 * @param {UrlConfig} urlConfig
 * @returns a urlConfig with bound auth token attached in the header
 */
export async function buildConfigBoundAuthToken(urlConfig: UrlConfigForBat): Promise<UrlConfig> {
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
      'x-bound-auth-token': errorOrBatString.right
    };
    sendBATSuccessEvent(urlConfig.url, batEventSampleRatePerMillion);
  } else {
    sendBATMissingEvent(urlConfig.url, errorOrBatString.left, batEventSampleRatePerMillion);
  }

  return config;
}

export default {
  shouldRequestWithBoundAuthToken,
  generateBoundAuthToken,
  buildConfigBoundAuthToken
};
