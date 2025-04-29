// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/**
 * An error code for a device integrity challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0
}

/**
 * Expected response from native integrity request.
 */
export type IntegrityResultType = {
  token: string;
  result: string;
};

/*
 * Callback Types
 */
export type OnChallengeDisplayedData = {
  displayed: true;
};

export type OnChallengeCompletedData = {
  integrityType: string;
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
 * The parameters required to render a device integrity challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  integrityType: string;
  requestHash: string;
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
 * Renders a device integrity challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
