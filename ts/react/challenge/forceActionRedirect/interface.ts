// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

import { TranslationConfig } from 'react-utilities';
import {
  BLOCK_SESSION_LANGUAGE_RESOURCES,
  FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES,
  FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES
} from './app.config';
import { ForceActionRedirectTranslateFunction } from './constants/resources';

/**
 * An error code for a force authenticator challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0
}

/*
 * Force Action Redirect Challenge Type
 */
export enum ForceActionRedirectChallengeType {
  ForceAuthenticator = 'ForceAuthenticator',
  ForceTwoStepVerification = 'ForceTwoStepVerification',
  BlockSession = 'BlockSession'
}

/*
 * Standard internal translation resource type for
 * all Force Action Redirect challenge types.
 */
export type ForceActionRedirectTranslationResources = {
  Action: string;
  Header: string;
  Body: string;
};

/*
 * Force Action Redirect Challenge Config
 */
export type ForceActionRedirectChallengeConfig = {
  redirectURLSignifier: string;
  translationConfig: TranslationConfig;
  translationResourceKeys:
    | typeof FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES
    | typeof FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES
    | typeof BLOCK_SESSION_LANGUAGE_RESOURCES;
  getTranslationResources: (
    translate: ForceActionRedirectTranslateFunction
  ) => ForceActionRedirectTranslationResources;
};

/*
 * Callback Types
 */

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
 * The parameters required to render a force authenticator challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  forceActionRedirectChallengeType: ForceActionRedirectChallengeType;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => boolean;

/**
 * Renders a force authenticator modal challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
