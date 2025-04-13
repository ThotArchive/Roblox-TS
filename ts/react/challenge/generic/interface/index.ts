// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

import { ParseChallengeSpecificProperties as NewParseChallengeSpecificProperties } from '@rbx/generic-challenge-types';
import * as Captcha from '../../captcha/interface';
import * as DeviceIntegrity from '../../deviceIntegrity/interface';
import * as EmailVerification from '../../emailVerification/interface';
import * as ForceActionRedirect from '../../forceActionRedirect/interface';
import * as PhoneVerification from '../../phoneVerification/interface';
import * as PrivateAccessToken from '../../privateAccessToken/interface';
import * as ProofOfSpace from '../../proofOfSpace/interface';
import * as ProofOfWork from '../../proofOfWork/interface';
import * as Reauthentication from '../../reauthentication/interface';
import * as Rostile from '../../rostile/interface';
import * as SecurityQuestions from '../../securityQuestions/interface';
import * as TwoStepVerification from '../../twoStepVerification/interface';
import ChallengeType from './challengeType';
import * as Metadata from './metadata/interface';

export { default as ChallengeType } from './challengeType';

/**
 * An error code for exceptions during the continue flow.
 */
export enum ErrorCodeGeneric {
  UNKNOWN = 0
}

/**
 * An error code for a given challenge type.
 */
export type ErrorCode<T extends ChallengeType> = {
  [ChallengeType.TWO_STEP_VERIFICATION]: TwoStepVerification.ErrorCode;
  [ChallengeType.CAPTCHA]: Captcha.ErrorCode;
  [ChallengeType.FORCE_AUTHENTICATOR]: ForceActionRedirect.ErrorCode;
  [ChallengeType.FORCE_TWO_STEP_VERIFICATION]: ForceActionRedirect.ErrorCode;
  [ChallengeType.SECURITY_QUESTIONS]: SecurityQuestions.ErrorCode;
  [ChallengeType.REAUTHENTICATION]: Reauthentication.ErrorCode;
  [ChallengeType.PROOF_OF_WORK]: ProofOfWork.ErrorCode;
  [ChallengeType.ROSTILE]: Rostile.ErrorCode;
  [ChallengeType.PRIVATE_ACCESS_TOKEN]: PrivateAccessToken.ErrorCode;
  [ChallengeType.DEVICE_INTEGRITY]: DeviceIntegrity.ErrorCode;
  [ChallengeType.PROOF_OF_SPACE]: ProofOfSpace.ErrorCode;
  [ChallengeType.EMAIL_VERIFICATION]: EmailVerification.ErrorCode;
  [ChallengeType.PHONE_VERIFICATION]: PhoneVerification.ErrorCode;
  [ChallengeType.BLOCK_SESSION]: ForceActionRedirect.ErrorCode;
}[T];

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
};

/**
 * Implementation Note: We could have constructed the type below in a different
 * way:
 *
 *   type OnChallengeCompletedData<T extends ChallengeType> = {
 *     challengeType: T;
 *     metadata: Metadata.Redemption<T>;
 *   };
 *
 * We could then specify that the completion callback's generic return type in
 * `renderChallenge` would be `OnChallengeCompletedData<ChallengeType>`, and in
 * doing so, we would expect TypeScript to compute the set union of all of the
 * individual completion data types. In other words, we expect the following
 * statement to be true:
 *
 *   OnChallengeCompletedData<ChallengeType> EQUALS
 *     OnChallengeCompletedData<Captcha>
 *       | OnChallengeCompletedData<2SV>
 *       | OnChallengeCompletedData<SecurityQuestions>
 *       | <etc.>
 *
 * Unfortunately, TypeScript will remove the correlation between `challengeType`
 * and `metadata` if we define `OnChallengeCompletedData` like that, resulting
 * in the following fact:
 *
 *   OnChallengeCompletedData<ChallengeType> EQUALS
 *     {
 *       challengeType: ChallengeType;
 *       metadata: Metadata.Redemption<ChallengeType>;
 *     }
 *
 * This means that any consumers trying to do something interesting with the
 * `metadata` in their callback won't be able to narrow its type using the value
 * of `challengeType` (e.g. by asserting that `challengeType` is equal to
 * `ChallengeType.CAPTCHA`, which should then imply a specific redemption type
 * to the TypeScript compiler).
 *
 * While strange, this is essentially an artifact of the statement that
 * `X | Y` and `Y | Z` are also subtypes of `X | Y | Z` (rather than only the
 * individual types `X`, `Y`, and `Z` being valid subtypes), so just asserting
 * that `challengeType == X` doesn't tell you anything about whether `metadata`
 * has a narrower type `Metadata.Redemption<X>` or `Metadata.Redemption<X | Y>`.
 *
 * By fully-specifying all of the callback data types BEFORE asking TypeScript
 * to compute their union, we are basically telling TypeScript that types like
 * `Metadata.Redemption<X | Y>` are NOT possible subtypes of this type.
 *
 * We use this trick in a number of other types as well, including
 * `OnChallengeInvalidatedData`, `ChallengeSpecificProperties`, and
 * `ChallengeErrorParameters`.
 */

/**
 * The possible types of the data passed to the challenge completion callback.
 *
 * Clients can discriminate between these types by using conditional statements
 * on the `challengeType` property.
 */
export type OnChallengeCompletedData = {
  [T in ChallengeType]: {
    challengeType: T;
    metadata: Metadata.Redemption<T>;
  };
}[ChallengeType];

/**
 * The possible types of the data passed to the challenge invalidation callback.
 *
 * Clients can discriminate between these types by using conditional statements
 * on the `challengeType` property.
 */
export type OnChallengeInvalidatedData = {
  [T in ChallengeType]: {
    challengeType: T;
    errorCode: ErrorCode<T> | ErrorCodeGeneric;
    errorMessage: string;
  };
}[ChallengeType];

export type OnChallengeDisplayedCallback = (data: OnChallengeDisplayedData) => unknown;

export type OnChallengeCompletedCallback = (data: OnChallengeCompletedData) => unknown;

export type OnChallengeInvalidatedCallback = (data: OnChallengeInvalidatedData) => unknown;

export type OnModalChallengeAbandonedCallback = (restoreModal: () => void) => unknown;

/*
 * Challenge Method
 */

type ChallengeParametersWithModal = {
  renderInline: false;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback;
};

type ChallengeParametersWithNoModal = {
  renderInline: true;
  onModalChallengeAbandoned: null;
};

/**
 * The properties relevant to render any generic challenge, regardless of the
 * specific challenge type.
 */
export type ChallengeBaseProperties = {
  /**
   * The DOM element to render a given challenge within.
   */
  containerId: string;
  /**
   * An app-type string that a given challenge can use to associate metrics.
   */
  appType?: string;
  /**
   * Whether single-page challenge UI should push new states into the browser
   * history during logical navigation (if supported by a given challenge).
   */
  shouldModifyBrowserHistory?: boolean;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onChallengeDisplayed?: OnChallengeDisplayedCallback;
  // New thunks registered by the grasshopper package. This uses the old type because all
  // references refer to the legacy base properties, which without extensive refactoring will
  // fail all derived-type discriminants.
  newRenderChallenge?: RenderChallenge;
  // This uses the new parse challenge interface because the new interface exposes zero
  // derived types (everthing is just `string`).
  newParseChallenge?: NewParseChallengeSpecificProperties;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The possible types of the challenge-specific arguments to `renderChallenge`.
 *
 * Clients can discriminate between these types by using conditional statements
 * on the `challengeType` property.
 */
export type ChallengeSpecificProperties = {
  [T in ChallengeType]: {
    challengeId: string;
    challengeType: T;
    challengeMetadata: Metadata.Challenge<T>;
  };
}[ChallengeType];

/**
 * The type of the arguments to `renderChallenge`.
 */
type RenderChallengeArguments = {
  challengeBaseProperties: ChallengeBaseProperties;
  challengeSpecificProperties: ChallengeSpecificProperties;
};

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (renderArguments: RenderChallengeArguments) => Promise<boolean>;

/**
 * Renders a generic challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;

/**
 * The type of `parseChallengeSpecificProperties`.
 */
export type ParseChallengeSpecificProperties = (
  challengeId: string,
  challengeTypeRaw: string,
  challengeMetadataJson: string
) => ChallengeSpecificProperties | null;

/**
 * Parses challenge-specific properties from a challenge type string and a JSON
 * string value representing challenge metadata.
 *
 * The output value of this function can (and almost always should) be passed
 * directly to `renderChallenge` as `challengeSpecificProperties`.
 *
 * This function should return `null` for invalid combinations of inputs.
 */
export declare const parseChallengeSpecificProperties: ParseChallengeSpecificProperties;

/**
 * The kind of a `ChallengeError` returned by a generic challenge interceptor.
 */
export enum ChallengeErrorKind {
  UNKNOWN = 'unknown',
  ABANDONED = 'abandoned',
  INVALIDATED = 'invalidated'
}

/**
 * The data for a `ChallengeError` returned by a generic challenge interceptor.
 */
export type ChallengeErrorData<K extends ChallengeErrorKind> = {
  [ChallengeErrorKind.UNKNOWN]: { challengeType?: ChallengeType };
  [ChallengeErrorKind.ABANDONED]: { challengeType: ChallengeType };
  [ChallengeErrorKind.INVALIDATED]: OnChallengeInvalidatedData;
}[K];

/**
 * The possible types of the parameters passed to construct a `ChallengeError`.
 *
 * Clients can discriminate between these types by using conditional statements
 * on the `kind` and `data.challengeType` properties.
 */
export type ChallengeErrorParameters = {
  [K in ChallengeErrorKind]: {
    kind: K;
    data: ChallengeErrorData<K>;
  };
}[ChallengeErrorKind];

/**
 * The instance type of `ChallengeError`.
 */
export interface ChallengeError<P extends ChallengeErrorParameters = ChallengeErrorParameters> {
  parameters: P;
}

/**
 * The type of `ChallengeError`.
 */
export interface ChallengeErrorConstructor {
  match(error: unknown): error is ChallengeError;
  matchAbandoned(
    error: unknown
  ): error is ChallengeError<{
    kind: ChallengeErrorKind.ABANDONED;
    data: ChallengeErrorData<ChallengeErrorKind.ABANDONED>;
  }>;
  new <P extends ChallengeErrorParameters = ChallengeErrorParameters>(
    parameters: P
  ): ChallengeError<P>;
}

/**
 * A custom error type to propagate challenge failures from a generic challenge
 * interceptor.
 *
 * Clients who want to handle Generic Challenge System errors should listen for
 * the `ChallengeError` type using the `instanceof` paradigm.
 *
 * Within a `Promise` chain, clients can use `ChallengeError.handleIfMatched` in
 * their catch-clauses to listen for `ChallengeError`s, run any custom handling
 * logic, and re-throw non-`ChallengeError`s to be handled further down the
 * chain.
 */
export declare const ChallengeError: ChallengeErrorConstructor;

/**
 * The type of the `retryRequest` callback parameter to `interceptChallenge`.
 */
export type RetryRequest<T> = (
  challengeId: string,
  redemptionMetadataJsonBase64: string
) => PromiseLike<T>;

/**
 * The type of `interceptChallenge`.
 */
export type InterceptChallenge = typeof interceptChallenge;

/**
 * Wraps `renderChallenge` to retry an HTTP request on challenge success or
 * throw an appropriate `ChallengeError` on challenge failure.
 */
export declare const interceptChallenge: <T>(parameters: {
  retryRequest: RetryRequest<T>;
  containerId: string;
  challengeId: string;
  challengeTypeRaw: string;
  challengeMetadataJsonBase64: string;
  // New thunks registered by the grasshopper package. This uses the old type because all
  // references refer to the legacy base properties, which without extensive refactoring will
  // fail all derived-type discriminants.
  newRenderChallenge?: RenderChallenge;
  // This uses the new parse challenge interface because the new interface exposes zero
  // derived types (everthing is just `string`).
  newParseChallenge?: NewParseChallengeSpecificProperties;
}) => Promise<T>;
