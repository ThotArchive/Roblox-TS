// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/*
 * Enum Types
 */

/**
 * The context in which captcha is being called.
 *
 * Parallels `CaptchaActionType` in the global typings.
 */
export enum ActionType {
  Login = 'Login',
  AppLogin = 'AppLogin',
  Signup = 'Signup',
  AppSignup = 'AppSignup',
  JoinGroup = 'JoinGroup',
  GroupWallPost = 'GroupWallPost',
  ResetPassword = 'ResetPassword',
  ToyCodeRedeem = 'ToyCodeRedeem',
  GameCardRedeem = 'GameCardRedeem',
  FollowUser = 'FollowUser',
  Generic = 'Generic',
  SupportRequest = 'SupportRequest',
  AssetComment = 'AssetComment',
  Marketplace = 'Marketplace'
}

/**
 * An error code for a captcha challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0
}

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
};

export type OnChallengeCompletedData = {
  captchaId: string;
  captchaToken: string;
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
 * The parameters required to render a captcha challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  actionType: ActionType;
  appType: string | null;
  dataExchangeBlob: string;
  unifiedCaptchaId: string;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => Promise<boolean>;

/**
 * Renders a captcha challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
