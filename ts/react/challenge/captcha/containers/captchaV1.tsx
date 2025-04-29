import React, { Fragment, useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import {
  CaptchaConstants,
  CaptchaRenderParameters,
  CaptchaTypeSpecification,
  FunCaptcha
} from 'Roblox';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import useCaptchaContext from '../hooks/useCaptchaContext';
import { ActionType, ErrorCode } from '../interface';
import { CaptchaReducerActionType } from '../store/action';

/**
 * A dynamic dispatch table for captcha callbacks. This allows us to pass our
 * third-party library a single set of callbacks for our singleton captcha
 * element while having the ability to re-render this component as necessary
 * (e.g. on repeated login attempts).
 */
const CHALLENGE_CAPTCHA_CALLBACKS: {
  shownCb?: CaptchaRenderParameters['shownCb'];
  errorCb?: CaptchaRenderParameters['errorCb'];
  successCb?: CaptchaRenderParameters['successCb'];
} = {};

/**
 * The static ID representing the singleton captcha element preserved by this
 * component. In an ideal world, we would have the ability to spawn multiple
 * unrelated captcha instances in different elements, but this seems to break
 * the callback behavior of our third-party library.
 */
const CHALLENGE_CAPTCHA_ELEMENT_ID = 'challenge-captcha-element';

/**
 * A singleton captcha element preserved by this component.
 */
const captchaElement = (() => {
  const newElement = document.createElement('div');
  newElement.className = 'challenge-captcha-body';
  newElement.id = CHALLENGE_CAPTCHA_ELEMENT_ID;
  return newElement;
})();

/**
 * Returns a React node that effectively injects a real DOM element into the
 * virtual DOM. We use this anti-pattern to create a stable reference for our
 * third-party captcha library to render into.
 */
const wrapRawElement = (rawElement: HTMLElement) => (
  <div ref={self => self?.insertAdjacentElement('afterend', rawElement)} />
);

/**
 * A container element for the Captcha V1 UI.
 */
const CaptchaV1: React.FC = () => {
  const {
    state: {
      actionType,
      appType,
      dataExchangeBlob,
      unifiedCaptchaId,
      renderInline,
      resources,
      metadataResponse,
      onChallengeDisplayed,
      onModalChallengeAbandoned,
      isModalVisible
    },
    dispatch
  } = useCaptchaContext();

  /*
   * Component State
   */

  const [pageLoading, setPageLoading] = useState<boolean>(true);

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: CaptchaReducerActionType.HIDE_MODAL_CHALLENGE
    });
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  };

  /*
   * Effects
   */

  // Not idempotent (requires cleanup); will be deprecated for React 18.
  const loadChallenge = () => {
    setPageLoading(true);

    // Compute an array of captcha type specs from metadata.
    const { funCaptchaPublicKeys } = metadataResponse;
    const captchaTypes: CaptchaTypeSpecification[] = [];
    Object.keys(CaptchaConstants.funCaptchaPublicKeyMap).forEach(actionTypeRaw => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const actionType = actionTypeRaw as ActionType;
      const publicKeyName = CaptchaConstants.funCaptchaPublicKeyMap[actionType];
      const publicKey = funCaptchaPublicKeys[publicKeyName];
      if (publicKey !== undefined) {
        captchaTypes.push({
          Type: actionType,
          PublicKey: publicKey
        });
      }
    });

    // Add the captcha type specs to the captcha service.
    FunCaptcha.addCaptchaTypes(captchaTypes, false);

    // Enable app type logging if an app type was provided.
    if (appType !== null) {
      FunCaptcha.setPerAppTypeLoggingEnabled(true, appType);
    }

    // Set our dynamically-dispatched callbacks.
    Object.assign(CHALLENGE_CAPTCHA_CALLBACKS, {
      shownCb: () => {
        setPageLoading(false);
        dispatch({
          type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE
        });
        onChallengeDisplayed({ displayed: true });
      },
      errorCb: () => {
        dispatch({
          type: CaptchaReducerActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: ErrorCode.UNKNOWN
        });
      },
      successCb: (captchaToken: string, captchaId: string) => {
        dispatch({
          type: CaptchaReducerActionType.SET_CHALLENGE_COMPLETED,
          onChallengeCompletedData: { captchaToken, captchaId }
        });
      }
    } as typeof CHALLENGE_CAPTCHA_CALLBACKS);

    // Render the captcha.
    FunCaptcha.render(captchaElement.id, {
      cType: actionType,
      inputParams: {
        dataExchange: dataExchangeBlob,
        unifiedCaptchaId
      },
      returnTokenInSuccessCb: true,
      // These callbacks do not change after the first time `render` is called
      // with a particular element ID, which requires us to use the dynamic
      // dispatch method described above.
      shownCb: () => CHALLENGE_CAPTCHA_CALLBACKS.shownCb && CHALLENGE_CAPTCHA_CALLBACKS.shownCb(),
      errorCb: errorCode =>
        CHALLENGE_CAPTCHA_CALLBACKS.errorCb && CHALLENGE_CAPTCHA_CALLBACKS.errorCb(errorCode),
      successCb: (captchaToken, captchaId) =>
        CHALLENGE_CAPTCHA_CALLBACKS.successCb &&
        CHALLENGE_CAPTCHA_CALLBACKS.successCb(captchaToken, captchaId)
    });
  };

  // Challenge loading effect:
  useEffect(() => {
    loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Render Properties
   */

  const captchaElementWrapped = wrapRawElement(captchaElement);

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
      <InlineChallengeBody>
        {pageLoading && (
          <span className='spinner spinner-default spinner-no-margin challenge-captcha-body' />
        )}
        {captchaElementWrapped}
      </InlineChallengeBody>
    </InlineChallenge>
  ) : (
    <Fragment>
      {!isModalVisible && (
        // If the modal has not rendered for the first time, captcha will not
        // actually have a container to render into. Since we only want to make
        // the modal visible for the first time when a visible challenge is
        // ready, we create an initial element for captcha (saved to a state
        // variable) that can be moved into the modal later on.
        <div style={{ display: 'none' }}>{captchaElementWrapped}</div>
      )}
      <Modal
        className='modal-modern modal-modern-challenge-captcha'
        show={isModalVisible}
        onHide={closeModal}
        backdrop='static'>
        <Modal.Body>
          <button
            type='button'
            className='challenge-captcha-close-button'
            onClick={closeModal}
            disabled={false}>
            <span className='icon-close' />
          </button>
          {pageLoading && (
            <span className='spinner spinner-default spinner-no-margin challenge-captcha-body' />
          )}
          {captchaElementWrapped}
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default CaptchaV1;
