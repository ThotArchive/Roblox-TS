// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/**
 * An error code for a Rostile challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0,
  INVALID_SESSION = 1
}

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
export enum PuzzleType {
  INVALID = 'ROSTILE_PUZZLE_TYPE_INVALID',
  VISIBLE = 'ROSTILE_PUZZLE_TYPE_VISIBLE',
  INVISIBLE = 'ROSTILE_PUZZLE_TYPE_INVISIBLE'
}

type ChallengeParametersWithModal = {
  renderInline: false;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback;
};

type ChallengeParametersWithNoModal = {
  renderInline: true;
  onModalChallengeAbandoned: null;
};

/**
 * The parameters required to render a Rostile challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  puzzleType: PuzzleType;
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
 * Renders a Rostile challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
