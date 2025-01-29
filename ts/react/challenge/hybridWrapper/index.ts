/* eslint-disable no-console */
/* eslint-disable no-case-declarations */
import { EnvironmentUrls, Hybrid } from 'Roblox';
import '../../../../css/challenge/captcha/captcha.scss';
import * as Captcha from '../captcha';
import * as DeviceIntegrity from '../deviceIntegrity';
import * as ForceActionRedirect from '../forceActionRedirect';
import { ForceActionRedirectChallengeType } from '../forceActionRedirect/interface';
import * as Generic from '../generic';
import { ChallengeType } from '../generic/interface';
import * as PrivateAccessToken from '../privateAccessToken';
import * as ProofOfSpace from '../proofOfSpace';
import * as ProofOfWork from '../proofOfWork';
import * as Reauthentication from '../reauthentication';
import { ReauthenticationMetadata } from '../reauthentication/interface';
import * as Rostile from '../rostile';
import * as SecurityQuestions from '../securityQuestions';
import * as TwoStepVerification from '../twoStepVerification';
import { LOG_PREFIX } from './app.config';
import { HybridTarget, RenderChallengeFromQueryParameters } from './interface';
import {
  readQueryParametersBase,
  readQueryParametersForCaptcha,
  readQueryParametersForDeviceIntegrity,
  readQueryParametersForGenericChallenge,
  readQueryParametersForPrivateAccessToken,
  readQueryParametersForProofOfSpace,
  readQueryParametersForProofOfWork,
  readQueryParametersForReauthentication,
  readQueryParametersForRostile,
  readQueryParametersForSecurityQuestions,
  readQueryParametersForTwoStepVerification
} from './query';

const HYBRID_TARGET_KEY = 'feature';
const CALLBACK_EVENT_NAME = 'callbackInputChanged';
const CLASS_LIGHT_MODE = 'light-theme';
const CLASS_DARK_MODE = 'dark-theme';

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ChallengeType } from '../generic/interface';
export { HybridTarget } from './interface';

const getHostname = () => {
  return EnvironmentUrls.domain.includes('sitetest') ? 'robloxlabs.com' : 'roblox.com';
};

// Small helper function for firing post messages to the parent window.
const dispatchPostMessageEvent = (
  type: HybridTarget,
  data: Record<string, unknown>,
  origin: string
) => {
  if (window.parent) {
    // The origin parameter is the entire subdomain string therefore any existing subdomains
    // on our environment urls need to be removed.
    const targetOrigin = EnvironmentUrls.domain
      ? `https://${origin}.${getHostname()}`
      : 'URL_NOT_FOUND';
    window.parent.postMessage(
      {
        genericChallengeResponse: {
          type,
          data
        }
      },
      targetOrigin
    );
  }
};

/**
 * Helper function for hybrid callbacks (including a fallback hybrid method for
 * Studio, which does not support the Roblox Hybrid library).
 */
const dispatchNavigateToFeatureHybridEvent = (
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  hybridTarget: HybridTarget,
  data: Record<string, unknown>,
  origin?: string
) => {
  console.log(LOG_PREFIX, 'Sending hybrid call:', hybridTarget);
  Hybrid.Navigation?.navigateToFeature(
    {
      [HYBRID_TARGET_KEY]: hybridTarget,
      data
    },
    () => console.log(LOG_PREFIX, 'Sent hybrid call:', hybridTarget)
  );

  // Fallback hybrid method for Studio:
  const callbackElementId = hybridTargetToCallbackInputId[hybridTarget];
  const callbackElement = document.getElementById(callbackElementId) as HTMLInputElement;
  if (callbackElement !== null && callbackElement.tagName === 'INPUT') {
    callbackElement.value = JSON.stringify(data);

    // Notify Studio with a custom HTML event.
    const callbackEvent = document.createEvent('HTMLEvents');
    callbackEvent.initEvent(CALLBACK_EVENT_NAME, false, false);
    callbackElement.dispatchEvent(callbackEvent);
  }

  // Handle window.postMessage transport protocol.
  try {
    if (origin) {
      dispatchPostMessageEvent(hybridTarget, data, origin);
    }
  } catch (error) {
    // Expected error cases here are target origin validation failures
    // and failure to dispatch messages.
    console.error(LOG_PREFIX, error);
  }
};

/**
 * Helper function for captcha hybrid challenges.
 */
const renderCaptchaChallengeFromQueryParameters = async (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string
): Promise<boolean> => {
  const queryParameters = readQueryParametersForCaptcha();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { actionType, dataExchangeBlob, unifiedCaptchaId } = queryParameters;
  const result = await Captcha.renderChallenge({
    containerId,
    actionType,
    appType,
    dataExchangeBlob,
    unifiedCaptchaId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for 2SV hybrid challenges.
 */
const renderTwoStepVerificationChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string
): boolean => {
  const queryParameters = readQueryParametersForTwoStepVerification();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { userId, challengeId, actionType, allowRememberDevice } = queryParameters;
  const result = TwoStepVerification.renderChallenge({
    containerId,
    userId,
    challengeId,
    actionType,
    appType,
    renderInline: true,
    // Page changes in the 2SV interface should trigger browser navigation so
    // the back button works correctly in Lua.
    shouldModifyBrowserHistory: true,
    shouldShowRememberDeviceCheckbox: allowRememberDevice,
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Helper function for security questions hybrid challenges.
 */
const renderSecurityQuestionsChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string
): boolean => {
  const queryParameters = readQueryParametersForSecurityQuestions();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { userId, sessionId } = queryParameters;
  const result = SecurityQuestions.renderChallenge({
    containerId,
    userId,
    sessionId,
    appType,
    renderInline: true,
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Helper function for re-authentication hybrid challenges.
 */
const renderReauthenticationChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  const queryParameters = readQueryParametersForReauthentication();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }

  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { defaultType, availableTypes, defaultTypeMetadataJSON } = queryParameters;

  let defaultTypeMetadata: ReauthenticationMetadata | null = null;

  if (defaultTypeMetadataJSON !== undefined) {
    try {
      defaultTypeMetadata = JSON.parse(defaultTypeMetadataJSON) as ReauthenticationMetadata;
    } catch (error) {
      return false;
    }
  }

  const result = Reauthentication.renderChallenge({
    containerId,
    renderInline: true,
    defaultType,
    availableTypes,
    defaultTypeMetadata,
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Helper function for private-access-token hybrid challenges.
 */
const renderPrivateAccessTokenChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  const queryParameters = readQueryParametersForPrivateAccessToken();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );
  const { challengeId } = queryParameters;

  const result = PrivateAccessToken.renderChallenge({
    containerId,
    challengeId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for proof-of-work hybrid challenges.
 */
const renderProofOfWorkChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  const queryParameters = readQueryParametersForProofOfWork();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { sessionId } = queryParameters;
  const result = ProofOfWork.renderChallenge({
    containerId,
    sessionId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for rostile hybrid challenges.
 */
const renderRostileChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string
): boolean => {
  const queryParameters = readQueryParametersForRostile();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { challengeId, puzzleType } = queryParameters;
  const result = Rostile.renderChallenge({
    containerId,
    challengeId,
    puzzleType,
    appType,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for device integrity hybrid challenges.
 */
const renderDeviceIntegrityChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  const queryParameters = readQueryParametersForDeviceIntegrity();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );
  const { challengeId, integrityType, requestHash } = queryParameters;

  const result = DeviceIntegrity.renderChallenge({
    containerId,
    challengeId,
    integrityType,
    requestHash,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for proof-of-space hybrid challenges.
 */
const renderProofOfSpaceChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  const queryParameters = readQueryParametersForProofOfSpace();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const { challengeId, artifacts } = queryParameters;
  const result = ProofOfSpace.renderChallenge({
    containerId,
    challengeId,
    artifacts,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data
      ),
    onModalChallengeAbandoned: null
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  return true;
};

/**
 * Helper function for generic hybrid challenges.
 */
const renderGenericChallengeFromQueryParameters = async (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
  origin: string
): Promise<boolean> => {
  const basePath = window.location.href.split('?')[0];
  const challengeSpecificProperties = readQueryParametersForGenericChallenge();
  // Handle hybrid callbacks for parse.
  if (challengeSpecificProperties === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  let result: boolean;
  if (origin.length > 0) {
    result = await Generic.renderChallenge({
      challengeBaseProperties: {
        containerId,
        renderInline: false,
        appType,
        shouldModifyBrowserHistory: true,
        onChallengeCompleted: data => {
          // Attempt to clear hybrid webview url to prevent re-rendering on a potential
          // webview cache.
          window.history.replaceState(null, '', basePath);
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_COMPLETED,
            data,
            origin
          );
        },
        onChallengeInvalidated: data => {
          window.history.replaceState(null, '', basePath);
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_INVALIDATED,
            data,
            origin
          );
        },
        onChallengeDisplayed: data => {
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_DISPLAYED,
            data,
            origin
          );
        },
        onModalChallengeAbandoned: () => {
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_INVALIDATED,
            { abandoned: true },
            origin
          );
        }
      },
      challengeSpecificProperties
    });
  } else {
    result = await Generic.renderChallenge({
      challengeBaseProperties: {
        containerId,
        renderInline: true,
        appType,
        shouldModifyBrowserHistory: true,
        onChallengeCompleted: data => {
          // Attempt to clear hybrid webview url to prevent re-rendering on a potential
          // webview cache.
          window.history.replaceState(null, '', basePath);
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_COMPLETED,
            data
          );
        },
        onChallengeInvalidated: data => {
          window.history.replaceState(null, '', basePath);
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_INVALIDATED,
            data
          );
        },
        onChallengeDisplayed: data => {
          dispatchNavigateToFeatureHybridEvent(
            hybridTargetToCallbackInputId,
            HybridTarget.CHALLENGE_DISPLAYED,
            data
          );
        },
        onModalChallengeAbandoned: null
      },
      challengeSpecificProperties
    });
  }

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
      origin
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
    origin
  );
  return true;
};

/**
 * Helper function for force authenticator hybrid challenges.
 */
const renderForceAuthenticatorChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  // Force Authenticator has no custom query parameters.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType: ForceActionRedirectChallengeType.ForceAuthenticator,
    renderInline: true,
    onModalChallengeAbandoned: null
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Helper function for force two-step verification hybrid challenges.
 */
const renderForceTwoStepVerificationChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  // Force Two-Step Verification has no custom query parameters.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType: ForceActionRedirectChallengeType.ForceTwoStepVerification,
    renderInline: true,
    onModalChallengeAbandoned: null
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Helper function for block session hybrid challenges.
 */
const renderBlockSessionChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string
): boolean => {
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true }
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType: ForceActionRedirectChallengeType.BlockSession,
    renderInline: true,
    onModalChallengeAbandoned: null
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false }
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true }
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true }
  );
  return true;
};

/**
 * Renders a hybrid challenge in a specific element based on the URL query
 * parameters.
 *
 * A hybrid challenge is one that calls back into a platform's native code by
 * following a designated calling convention.
 */
export const renderChallengeFromQueryParameters: RenderChallengeFromQueryParameters = async ({
  containerId,
  hybridTargetToCallbackInputId
}) => {
  // Immediately send a hybrid event to confirm that the DOM has loaded without
  // any DOM or JavaScript errors.
  dispatchNavigateToFeatureHybridEvent(
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PAGE_LOADED,
    { pageLoaded: true }
  );
  const queryParametersBase = readQueryParametersBase();
  // Handle hybrid callbacks for parse. The final parsed true callback will
  // happen in the individual challenge render functions, since each challenge
  // has some additional parameters it might parse.
  if (queryParametersBase === null) {
    dispatchNavigateToFeatureHybridEvent(
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false }
    );
    return false;
  }

  // Our `web-frontend` modal is rendered in Barista via an injected `iframe`.
  // We want to set the `iframe` background as transparent so that our modal
  // appears to be rendering directly on the underlying Barista page.
  if (queryParametersBase.baristaMode) {
    document.body.style.backgroundColor = 'transparent';
  }

  // Set dark or light mode theming.
  if (queryParametersBase.darkMode) {
    document.body.classList.remove(CLASS_LIGHT_MODE);
    document.body.classList.add(CLASS_DARK_MODE);
  } else {
    document.body.classList.remove(CLASS_DARK_MODE);
    document.body.classList.add(CLASS_LIGHT_MODE);
  }

  // Read more query parameters and render the specific challenge from the base
  // parameters.
  switch (queryParametersBase.challengeType) {
    case ChallengeType.CAPTCHA:
      return renderCaptchaChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.FORCE_AUTHENTICATOR:
      return renderForceAuthenticatorChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.FORCE_TWO_STEP_VERIFICATION:
      return renderForceTwoStepVerificationChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.TWO_STEP_VERIFICATION:
      return renderTwoStepVerificationChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.SECURITY_QUESTIONS:
      return renderSecurityQuestionsChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.REAUTHENTICATION:
      return renderReauthenticationChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.PROOF_OF_WORK:
      return renderProofOfWorkChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.ROSTILE:
      return renderRostileChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.PRIVATE_ACCESS_TOKEN:
      return renderPrivateAccessTokenChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.DEVICE_INTEGRITY:
      return renderDeviceIntegrityChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.PROOF_OF_SPACE:
      return renderProofOfSpaceChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case ChallengeType.PHONE_VERIFICATION:
      // Supported via generic challenge rendering.
      return false;
    case ChallengeType.EMAIL_VERIFICATION:
      // Supported via generic challenge rendering.
      return false;
    case ChallengeType.BLOCK_SESSION:
      return renderBlockSessionChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType
      );
    case 'generic':
      return renderGenericChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
        queryParametersBase.origin
      );
    default:
      // If we have handled all of the challenge types above, TypeScript will
      // infer `queryParametersBase` to have type `never` and the following
      // assignment should compile successfully.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const assertCodeIsUnreachable: never = queryParametersBase.challengeType;
      return false;
  }
};
