// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

import * as Captcha from '../captcha/interface';
import { ChallengeType } from '../generic/interface';
import * as DeviceIntegrity from '../deviceIntegrity/interface';
import * as PhoneVerification from '../phoneVerification/interface';
import * as EmailVerification from '../emailVerification/interface';
import * as PrivateAccessToken from '../privateAccessToken/interface';
import * as ProofOfSpace from '../proofOfSpace/interface';
import * as ProofOfWork from '../proofOfWork/interface';
import * as Reauthentication from '../reauthentication/interface';
import * as Rostile from '../rostile/interface';
import * as SecurityQuestions from '../securityQuestions/interface';
import * as TwoStepVerification from '../twoStepVerification/interface';

/**
 * Values of the `feature` field when sending a hybrid `navigateToFeature` back
 * to a hybrid challenge client.
 */
export enum HybridTarget {
  CHALLENGE_COMPLETED = 'challengeCompleted',
  CHALLENGE_DISPLAYED = 'challengeDisplayed',
  CHALLENGE_INITIALIZED = 'challengeInitialized',
  CHALLENGE_INVALIDATED = 'challengeInvalidated',
  CHALLENGE_PAGE_LOADED = 'challengePageLoaded',
  CHALLENGE_PARSED = 'challengeParsed'
}

/**
 * The type of data returned from a given challenge type.
 *
 * This type exists only for reference purposes during integration.
 */
export type OnChallengeCompletedData<T extends ChallengeType> = {
  [ChallengeType.TWO_STEP_VERIFICATION]: TwoStepVerification.OnChallengeCompletedData;
  [ChallengeType.CAPTCHA]: Captcha.OnChallengeCompletedData;
  [ChallengeType.FORCE_AUTHENTICATOR]: never;
  [ChallengeType.FORCE_TWO_STEP_VERIFICATION]: never;
  [ChallengeType.SECURITY_QUESTIONS]: SecurityQuestions.OnChallengeCompletedData;
  [ChallengeType.REAUTHENTICATION]: Reauthentication.OnChallengeCompletedData;
  [ChallengeType.PROOF_OF_WORK]: ProofOfWork.OnChallengeCompletedData;
  [ChallengeType.ROSTILE]: Rostile.OnChallengeCompletedData;
  [ChallengeType.PRIVATE_ACCESS_TOKEN]: PrivateAccessToken.OnChallengeCompletedData;
  [ChallengeType.DEVICE_INTEGRITY]: DeviceIntegrity.OnChallengeCompletedData;
  [ChallengeType.PROOF_OF_SPACE]: ProofOfSpace.OnChallengeCompletedData;
  [ChallengeType.PHONE_VERIFICATION]: PhoneVerification.OnChallengeCompletedData;
  [ChallengeType.EMAIL_VERIFICATION]: EmailVerification.OnChallengeCompletedData;
  [ChallengeType.BLOCK_SESSION]: never;
}[T];

/**
 * The parameters required to render a challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  hybridTargetToCallbackInputId: { [K in HybridTarget]: string };
};

/**
 * The type of `renderChallengeFromQueryParameters`.
 */
export type RenderChallengeFromQueryParameters = (
  challengeParameters: ChallengeParameters
) => Promise<boolean>;

/**
 * Renders a hybrid challenge in a specific element based on the URL query
 * parameters.
 *
 * A hybrid challenge is one that calls back into a platform's native code by
 * following a designated calling convention.
 */
export declare const renderChallengeFromQueryParameters: RenderChallengeFromQueryParameters;
