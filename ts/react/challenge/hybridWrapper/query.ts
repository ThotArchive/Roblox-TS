/* eslint-disable no-console */
import { UrlParser } from 'Roblox';
import { fido2Util } from 'core-roblox-utilities';
import * as z from 'zod';
import { ActionType } from '../captcha/interface';
import * as Generic from '../generic';
import { ChallengeSpecificProperties, ChallengeType } from '../generic/interface';
import { ReauthenticationType } from '../reauthentication/interface';
import * as ProofOfSpace from '../proofOfSpace/interface';
import * as Rostile from '../rostile/interface';
import * as TwoStepVerification from '../twoStepVerification';
import { LOG_PREFIX } from './app.config';

const APP_TYPE_UNKNOWN = 'unknown';
const CHALLENGE_TYPE_GENERIC = 'generic';

/**
 * The key constants for different query parameters.
 */
enum QueryParameterKey {
  ACTION_TYPE = 'action-type',
  ALLOW_REMEMBER_DEVICE = 'allow-remember-device',
  APP_TYPE = 'app-type',
  BARISTA_MODE = 'barista-mode',
  CAPTCHA_ID = 'captcha-id',
  CHALLENGE_ID = 'challenge-id',
  CHALLENGE_METADATA_JSON = 'challenge-metadata-json',
  CHALLENGE_TYPE = 'challenge-type',
  DARK_MODE = 'dark-mode',
  DATA_EXCHANGE_BLOB = 'data-exchange-blob',
  GENERIC_CHALLENGE_TYPE = 'generic-challenge-type',
  INTEGRITY_TYPE = 'integrity-type',
  REQUEST_HASH = 'request-hash',
  PROOF_OF_SPACE_ARTIFACTS = 'proof-of-space-artifacts',
  PUZZLE_TYPE = 'puzzle-type',
  SESSION_ID = 'session-id',
  USER_ID = 'user-id',
  DEFAULT_TYPE = 'default-type',
  AVAILABLE_TYPES = 'available-types',
  DEFAULT_TYPE_METADATA_JSON = 'default-type-metadata-json',
  GENERIC_CHALLENGE_ID = 'generic-challenge-id',
  ORIGIN = 'origin'
}

/**
 * Decodes a URL-safe Base-64 string as defined in RFC 4648.
 */
const decodeBase64Url = (base64UrlString: string): string | null => {
  // Remove all characters not in the Base-64 URL-safe set.
  // This effectively serves to trim and concatenate disjoint inputs, but it
  // will not fix bad inputs.
  const rawString = base64UrlString.replace(/[^A-Za-z0-9-_]/g, '');

  // Add standard padding characters and make URL-unsafe replacements.
  const replacedString = fido2Util.base64UrlStringToBase64String(rawString);

  try {
    return atob(replacedString);
  } catch (error) {
    // Specifically catch and suppress if `atob` gets invalid Base-64 input.
    if (error instanceof DOMException && error.code === DOMException.INVALID_CHARACTER_ERR) {
      // eslint-disable-next-line no-console
      console.error(LOG_PREFIX, 'Base-64 decoding failed', error);
      return null;
    }
    throw error;
  }
};

const QueryParametersBaseValidator = z.object({
  // Strip hyphens from the challenge type for the benefit of legacy Lua code
  // (which used hyphens for challenge types per the original GCS contract).
  challengeType: z.preprocess(
    rawType => (typeof rawType === 'string' ? rawType.replace(/-/g, '') : rawType),
    z.union([z.nativeEnum(ChallengeType), z.literal(CHALLENGE_TYPE_GENERIC)])
  ),
  darkMode: z
    .union([z.literal('false'), z.literal('true')])
    .default('false')
    .transform(value => value === 'true'),
  appType: z.string().default(APP_TYPE_UNKNOWN),
  baristaMode: z
    .union([z.literal('false'), z.literal('true')])
    .default('false')
    .transform(value => value === 'true'),
  // The origin query param is the subdomain used for the target origin for window.postMessage.
  origin: z.string().default('')
});

export type QueryParametersBase = z.infer<typeof QueryParametersBaseValidator>;

/**
 * Reads query parameters to determine which hybrid challenge to render.
 */
export const readQueryParametersBase = (): QueryParametersBase | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersBase, string> = {
    challengeType: queryParameters[QueryParameterKey.CHALLENGE_TYPE],
    darkMode: queryParameters[QueryParameterKey.DARK_MODE],
    appType: queryParameters[QueryParameterKey.APP_TYPE],
    baristaMode: queryParameters[QueryParameterKey.BARISTA_MODE],
    origin: queryParameters[QueryParameterKey.ORIGIN]
  };

  const result = QueryParametersBaseValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForCaptchaValidator = z.object({
  actionType: z.nativeEnum(ActionType),
  dataExchangeBlob: z.string(),
  unifiedCaptchaId: z.string()
});

export type QueryParametersForCaptcha = z.infer<typeof QueryParametersForCaptchaValidator>;

/**
 * Reads query parameters to render a hybrid captcha challenge.
 */
export const readQueryParametersForCaptcha = (): QueryParametersForCaptcha | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForCaptcha, string> = {
    actionType: queryParameters[QueryParameterKey.ACTION_TYPE],
    dataExchangeBlob: queryParameters[QueryParameterKey.DATA_EXCHANGE_BLOB],
    unifiedCaptchaId: queryParameters[QueryParameterKey.CAPTCHA_ID]
  };

  const result = QueryParametersForCaptchaValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForTwoStepVerificationValidator = z.object({
  userId: z.string(),
  challengeId: z.string(),
  actionType: z.nativeEnum(TwoStepVerification.ActionType),
  allowRememberDevice: z
    .union([z.literal('false'), z.literal('true')])
    .transform(value => value === 'true')
});

export type QueryParametersForTwoStepVerification = z.infer<
  typeof QueryParametersForTwoStepVerificationValidator
>;

/**
 * Reads query parameters to render a hybrid 2SV challenge.
 */
export const readQueryParametersForTwoStepVerification = (): QueryParametersForTwoStepVerification | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForTwoStepVerification, string> = {
    userId: queryParameters[QueryParameterKey.USER_ID],
    challengeId: queryParameters[QueryParameterKey.CHALLENGE_ID],
    actionType: queryParameters[QueryParameterKey.ACTION_TYPE],
    allowRememberDevice: queryParameters[QueryParameterKey.ALLOW_REMEMBER_DEVICE]
  };

  const result = QueryParametersForTwoStepVerificationValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForSecurityQuestionsValidator = z.object({
  userId: z.string(),
  sessionId: z.string()
});

export type QueryParametersForSecurityQuestions = z.infer<
  typeof QueryParametersForSecurityQuestionsValidator
>;

/**
 * Reads query parameters to render a hybrid security questions challenge.
 */
export const readQueryParametersForSecurityQuestions = (): QueryParametersForSecurityQuestions | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForSecurityQuestions, string> = {
    userId: queryParameters[QueryParameterKey.USER_ID],
    sessionId: queryParameters[QueryParameterKey.SESSION_ID]
  };

  const result = QueryParametersForSecurityQuestionsValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForReauthenticationValidator = z.object({
  defaultType: z.nativeEnum(ReauthenticationType),
  availableTypes: z.array(z.nativeEnum(ReauthenticationType)),
  defaultTypeMetadataJSON: z.string().optional()
});

export type QueryParametersForReauthentication = z.infer<
  typeof QueryParametersForReauthenticationValidator
>;

export const readQueryParametersForReauthentication = (): QueryParametersForReauthentication | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<
    keyof QueryParametersForReauthentication,
    string | Array<string>
  > = {
    defaultType: queryParameters[QueryParameterKey.DEFAULT_TYPE],
    availableTypes: queryParameters[QueryParameterKey.AVAILABLE_TYPES].split(','),
    defaultTypeMetadataJSON: queryParameters[QueryParameterKey.DEFAULT_TYPE_METADATA_JSON]
  };

  const result = QueryParametersForReauthenticationValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  const { defaultType, availableTypes, defaultTypeMetadataJSON } = result.data;

  if (defaultTypeMetadataJSON === undefined) {
    return result.data;
  }
  const defaultTypeMetadataJsonDecoded = decodeBase64Url(defaultTypeMetadataJSON);
  if (defaultTypeMetadataJsonDecoded === null) {
    return null;
  }

  return {
    defaultType,
    availableTypes,
    defaultTypeMetadataJSON: defaultTypeMetadataJsonDecoded
  };
};

const QueryParametersForProofOfWorkValidator = z.object({
  sessionId: z.string()
});

export type QueryParametersForProofOfWork = z.infer<typeof QueryParametersForProofOfWorkValidator>;

/**
 * Reads query parameters to render a hybrid proof-of-work challenge.
 */
export const readQueryParametersForProofOfWork = (): QueryParametersForProofOfWork | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForProofOfWork, string> = {
    sessionId: queryParameters[QueryParameterKey.SESSION_ID]
  };

  const result = QueryParametersForProofOfWorkValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForRostileValidator = z.object({
  challengeId: z.string(),
  puzzleType: z.nativeEnum(Rostile.PuzzleType)
});

export type QueryParametersForRostile = z.infer<typeof QueryParametersForRostileValidator>;

/**
 * Reads query parameters to render a hybrid rostile challenge.
 */
export const readQueryParametersForRostile = (): QueryParametersForRostile | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForRostile, string> = {
    challengeId: queryParameters[QueryParameterKey.CHALLENGE_ID],
    puzzleType: queryParameters[QueryParameterKey.PUZZLE_TYPE]
  };

  const result = QueryParametersForRostileValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForPrivateAccessTokenValidator = z.object({
  challengeId: z.string()
});

export type QueryParametersForPrivateAccessToken = z.infer<
  typeof QueryParametersForPrivateAccessTokenValidator
>;

/**
 * Reads query parameters to render a hybrid private-access-token challenge.
 */
export const readQueryParametersForPrivateAccessToken = (): QueryParametersForPrivateAccessToken | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForPrivateAccessToken, string> = {
    challengeId: queryParameters[QueryParameterKey.CHALLENGE_ID]
  };

  const result = QueryParametersForPrivateAccessTokenValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForDeviceIntegrityValidator = z.object({
  challengeId: z.string(),
  integrityType: z.string(),
  requestHash: z.string()
});

export type QueryParametersForDeviceIntegrity = z.infer<
  typeof QueryParametersForDeviceIntegrityValidator
>;
/**
 * Reads query parameters to render a hybrid device integrity challenge.
 */
export const readQueryParametersForDeviceIntegrity = (): QueryParametersForDeviceIntegrity | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForDeviceIntegrity, string> = {
    challengeId: queryParameters[QueryParameterKey.CHALLENGE_ID],
    integrityType: queryParameters[QueryParameterKey.INTEGRITY_TYPE],
    requestHash: queryParameters[QueryParameterKey.REQUEST_HASH]
  };

  const result = QueryParametersForDeviceIntegrityValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForProofOfSpaceValidator = z.object({
  challengeId: z.string(),
  artifacts: z.object({
    puzzleType: z.nativeEnum(ProofOfSpace.PuzzleType),
    seed: z.string(),
    rounds: z.string(),
    layers: z.string()
  })
});

export type QueryParametersForProofOfSpace = z.infer<
  typeof QueryParametersForProofOfSpaceValidator
>;

/**
 * Reads query parameters to render a hybrid proof-of-space challenge.
 */
export const readQueryParametersForProofOfSpace = (): QueryParametersForProofOfSpace | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<keyof QueryParametersForProofOfSpace, string> = {
    challengeId: queryParameters[QueryParameterKey.CHALLENGE_ID],
    artifacts: queryParameters[QueryParameterKey.PROOF_OF_SPACE_ARTIFACTS]
  };

  const result = QueryParametersForProofOfSpaceValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  return result.data;
};

const QueryParametersForGenericChallengeValidator = z.object({
  // This is the `generic-challenge-id` query parameter, as opposed to the
  // `challenge-id` parameter used for the hybrid 2sv challenge. TODO: Remove
  // default value once lua changes are released.
  challengeId: z.string().default(''),
  // This is the `generic-challenge-type` query parameter rather than the plain
  // `challenge-type` parameter. The latter will just be `generic` for a generic
  // challenge.
  challengeType: z.nativeEnum(ChallengeType),
  challengeMetadataJson: z.string()
});

/**
 * Reads query parameters to render a hybrid generic challenge.
 */
export const readQueryParametersForGenericChallenge = (): ChallengeSpecificProperties | null => {
  const queryParameters = UrlParser.getParametersAsObject();
  const queryParametersRenamed: Record<
    keyof z.infer<typeof QueryParametersForGenericChallengeValidator>,
    string
  > = {
    challengeId: queryParameters[QueryParameterKey.GENERIC_CHALLENGE_ID],
    challengeType: queryParameters[QueryParameterKey.GENERIC_CHALLENGE_TYPE],
    challengeMetadataJson: queryParameters[QueryParameterKey.CHALLENGE_METADATA_JSON]
  };

  const result = QueryParametersForGenericChallengeValidator.safeParse(queryParametersRenamed);
  if (!result.success) {
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  const { challengeId, challengeType, challengeMetadataJson } = result.data;
  // Due to inconsistencies in URL-encoding across UA platforms, we pack the
  // metadata payload in URL-safe Base-64 when passing it to be rendered in a
  // hybrid web view. These characters are unlikely to be tampered with.
  const challegeMetadataJsonDecoded = decodeBase64Url(challengeMetadataJson);
  if (challegeMetadataJsonDecoded === null) {
    return null;
  }

  return Generic.parseChallengeSpecificProperties(
    challengeId,
    challengeType,
    challegeMetadataJsonDecoded
  );
};
