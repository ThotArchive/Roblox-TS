// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/**
 * An error code for a proof-of-space challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0,
  SESSION_INVALID = 1,
  ANSWER_INVALID = 2,
  WORKER_LOAD_ERROR = 3,
  TIMEOUT = 4
}

/*
 * Challenge Method
 */
export enum PuzzleType {
  INVALID = 'PROOF_OF_SPACE_PUZZLE_TYPE_INVALID',
  NONINTERACTIVE = 'PROOF_OF_SPACE_PUZZLE_TYPE_NONINTERACTIVE',
  INTERACTIVE = 'PROOF_OF_SPACE_PUZZLE_TYPE_INTERACTIVE'
}

export type Artifacts = {
  puzzleType: PuzzleType;
  seed: string;
  rounds: string; // Typed as string due to limitations of the zod version we are on for transformation/coercion.
  layers: string; // Same as rounds.
};

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
};

export type OnChallengeCompletedData = {
  redemptionToken: string;
};

export type OnChallengeInvalidatedData = {
  errorCode: ErrorCode;
  errorMessage: string;
};

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
 * The parameters required to render a Proof-of-Space challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  artifacts: Artifacts;
  appType?: string;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => boolean;

/**
 * Renders a proof-of-space challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
