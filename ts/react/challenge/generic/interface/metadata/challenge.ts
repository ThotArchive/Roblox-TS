// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

import * as CaptchaInterface from '../../../captcha/interface';
import {
  ReauthenticationType,
  ReauthenticationMetadata
} from '../../../reauthentication/interface';
import * as ProofOfSpaceInterface from '../../../proofOfSpace/interface';
import * as RostileInterface from '../../../rostile/interface';
import * as TwoStepVerificationInterface from '../../../twoStepVerification/interface';

/**
 * The challenge metadata type that all other metadata types share in common.
 */
export type Shared = {
  sharedParameters?: {
    shouldAnalyze?: boolean;
    genericChallengeId?: string;
    useContinueMode?: boolean;
  };
};

export enum FrictionContext {
  ZERO = 'FRICTION_CONTEXT_INVALID',
  ONE = 'FRICTION_CONTEXT_ONE'
}

/**
 * The challenge metadata type returned by the GCS for `TwoStepVerification`
 * with any custom properties added by clients.
 */
export type TwoStepVerification = {
  userId: string;
  challengeId: string;
  // TODO: Consider adding a `path` parameter in the future to better inform our
  // client-side metrics (we may also want to do this on the back-end when GCS
  // calls the 2SV Service).
  shouldShowRememberDeviceCheckbox: boolean;
  actionType: TwoStepVerificationInterface.ActionType;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `Captcha` with any custom
 * properties added by clients.
 */
export type Captcha = {
  actionType: CaptchaInterface.ActionType;
  dataExchangeBlob: string;
  unifiedCaptchaId: string;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `SecurityQuestions` with
 * any custom properties added by clients.
 */
export type SecurityQuestions = {
  userId: string;
  sessionId: string;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `Reauthentication` with
 * any custom properties added by clients.
 */
export type Reauthentication = {
  defaultType: ReauthenticationType;
  availableTypes: ReauthenticationType[];
  // defaultTypeMetadata will either be populated or explicitly null, but never undefined.
  defaultTypeMetadata: ReauthenticationMetadata | null;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `ForceAuthenticator` with
 * any custom properties added by clients.
 */
export type ForceAuthenticator = {} & Shared;

/**
 * The challenge metadata type returned by the GCS for `ForceTwoStepVerification` with
 * any custom properties added by clients.
 */
export type ForceTwoStepVerification = {} & Shared;

/**
 * The challenge metadata type returned by the GCS for `ProofOfWork` with any
 * custom properties added by clients.
 */
export type ProofOfWork = {
  sessionId: string;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `Rostile` with any
 * custom properties added by clients.
 */
export type Rostile = {
  challengeId: string;
  puzzleType: RostileInterface.PuzzleType;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `PrivateAccessToken` with any
 * custom properties added by clients.
 */
export type PrivateAccessToken = {
  challengeId: string;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `DeviceIntegrity` with
 * any custom properties added by clients.
 */
export type DeviceIntegrity = {
  integrityType: string;
  requestHash: string;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `ProofOfSpace` with any
 * custom properties added by clients.
 */
export type ProofOfSpace = {
  challengeId: string;
  artifacts: ProofOfSpaceInterface.Artifacts;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `PhoneVerification` with
 * any custom properties added by clients.
 */
export type PhoneVerification = {
  frictionContext?: FrictionContext;
} & Shared;

/**
 * The challenge metadata type returned by the GCS for `EmailVerification` with any
 * custom properties added by clients.
 */
export type EmailVerification = {
  frictionContext?: FrictionContext;
} & Shared;
