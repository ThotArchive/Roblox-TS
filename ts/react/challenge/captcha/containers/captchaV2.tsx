import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-style-guide';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import {
  EVENT_CONSTANTS,
  FUNCAPTCHA_PUBLIC_KEY_MAP,
  FUNCAPTCHA_VERSION_V2,
  LOG_PREFIX
} from '../app.config';
import useCaptchaContext from '../hooks/useCaptchaContext';
import { ErrorCode } from '../interface';
import { CaptchaReducerActionType } from '../store/action';

/*
 * Visible Captcha Override Control
 */

const QUERY_KEY_FC_NOSUPPRESS = 'fc_nosuppress' as const;
const queryParameterFcNosuppress = new URLSearchParams(window.location.search).get(
  QUERY_KEY_FC_NOSUPPRESS
);
const QUERY_KEY_FC_SUPPRESS = 'fc_suppress' as const;
const queryParameterFcSuppress = new URLSearchParams(window.location.search).get(
  QUERY_KEY_FC_SUPPRESS
);
const queryStringToPropagate =
  // eslint-disable-next-line no-nested-ternary
  queryParameterFcNosuppress !== null
    ? `&${QUERY_KEY_FC_NOSUPPRESS}=${queryParameterFcNosuppress}`
    : queryParameterFcSuppress !== null
    ? `&${QUERY_KEY_FC_SUPPRESS}=${queryParameterFcSuppress}`
    : '';

/**
 * The type of an event from the Arkose iframe.
 *
 * Keep this in sync with the JS in `arkoseIframe.html`.
 */
type CaptchaElementEvent =
  | {
      arkoseIframeId: string;
      eventId: 'challenge-complete';
      payload: {
        captchaToken: string;
      };
    }
  | {
      arkoseIframeId: string;
      eventId: 'challenge-error';
      payload: {
        captchaToken?: string;
        error: string;
      };
    }
  | {
      arkoseIframeId: string;
      eventId: 'challenge-suppressed';
      payload: {
        captchaToken: string;
      };
    }
  | {
      arkoseIframeId: string;
      eventId: 'challenge-shown';
      payload: {
        captchaToken: string;
      };
    }
  | {
      arkoseIframeId: string;
      eventId: 'challenge-resize';
      payload: {
        width: string;
        height: string;
      };
    }
  | {
      arkoseIframeId: string;
      eventId: 'challenge-ready';
    };

// An instance counter for this component used to route messages from an Arkose
// `iframe` to the instance that spawned it.
let nextArkoseIframeId = 0;

/**
 * A container element for the Captcha V2 UI.
 */
const CaptchaV2: React.FC = () => {
  const {
    state: {
      actionType,
      dataExchangeBlob,
      unifiedCaptchaId,
      renderInline,
      resources,
      metadataResponse,
      eventService,
      metricsService,
      onChallengeDisplayed,
      onModalChallengeAbandoned,
      isModalVisible,
      onChallengeCompletedData,
      onChallengeInvalidatedData
    },
    dispatch
  } = useCaptchaContext();

  /*
   * Component State
   */

  const [arkoseIframeId] = useState<string>(() => {
    const id = nextArkoseIframeId;
    nextArkoseIframeId += 1;
    return id.toString();
  });
  const [publicKey, setPublicKey] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [gotActiveCaptcha, setGotActiveCaptcha] = useState<boolean>(false);
  const [solveStartTimeStamp, setSolveStartTimeStamp] = useState<number | null>(null);
  const [captchaElementListenerReady, setCaptchaElementListenerReady] = useState<boolean>(false);
  const captchaElement = useRef<HTMLIFrameElement>(null);

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

  const onComplete = useCallback(
    (captchaToken: string, captchaId: string) =>
      dispatch({
        type: CaptchaReducerActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: { captchaToken, captchaId }
      }),
    [dispatch]
  );

  const onError = useCallback(
    () =>
      dispatch({
        type: CaptchaReducerActionType.SET_CHALLENGE_INVALIDATED,
        errorCode: ErrorCode.UNKNOWN
      }),
    [dispatch]
  );

  const onShown = useCallback(() => {
    setPageLoading(false);
    dispatch({
      type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE
    });
    setGotActiveCaptcha(true);
    onChallengeDisplayed({ displayed: true });
    setSolveStartTimeStamp(Date.now());
  }, [dispatch, onChallengeDisplayed]);

  /*
   * Effects
   */

  // Idempotent function (no cleanup required):
  const loadChallenge = () => {
    setPageLoading(true);

    // Use metadata to select the right Arkose key for our current action type.
    const { funCaptchaPublicKeys } = metadataResponse;
    const publicKeyName = FUNCAPTCHA_PUBLIC_KEY_MAP[actionType];
    setPublicKey(funCaptchaPublicKeys[publicKeyName] || '');
    metricsService.fireTriggeredEvent();
  };

  // Challenge loading effect:
  useEffect(() => {
    loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect that sets up an iframe listener for the Arkose iframe (and tears it
  // down when the wrapper component is unmounted):
  useEffect(() => {
    const arkoseIframeListener = (event: MessageEvent) => {
      try {
        const captchaElementEvent: CaptchaElementEvent = JSON.parse(
          event.data
        ) as CaptchaElementEvent;
        // Validation sanity check (in case anything else on the page is using
        // the `postMessage` API). If the object has the `arkoseIframeId` prop
        // then we assume that it is from the Arkose `iframe`.
        if (!Object.prototype.hasOwnProperty.call(captchaElementEvent, 'arkoseIframeId')) {
          return;
        }
        // Ensure that we only receive messages from the `iframe` this component
        // instance spawned. (Even though we clean up event listeners when
        // unmounting the component, the default behavior when a user clicks the
        // `X` button is to hide the modal and allow the spawning consumer to
        // simply re-open the challenge. In these instances, the component is
        // not truly unmounted, and in any case, we do not want multiple captcha
        // instances to conflict with each other via event handler globals).
        if (captchaElementEvent.arkoseIframeId !== arkoseIframeId) {
          return;
        }
        switch (captchaElementEvent.eventId) {
          case 'challenge-complete': {
            onComplete(captchaElementEvent.payload.captchaToken, unifiedCaptchaId);
            metricsService.fireSuccessEvent();
            let solveDuration = 0;
            if (solveStartTimeStamp) {
              solveDuration = Date.now() - solveStartTimeStamp;
            }
            eventService.sendCaptchaRedeemEvent(
              actionType,
              solveDuration,
              true,
              captchaElementEvent.payload.captchaToken,
              unifiedCaptchaId,
              FUNCAPTCHA_VERSION_V2
            );
            break;
          }
          case 'challenge-error':
            onError();
            metricsService.fireProviderErrorEvent();
            eventService.sendCaptchaInitiatedEvent(
              actionType,
              EVENT_CONSTANTS.captchaInitiatedChallengeType.error,
              captchaElementEvent.payload.captchaToken || '',
              unifiedCaptchaId,
              captchaElementEvent.payload.error,
              FUNCAPTCHA_VERSION_V2
            );
            break;
          case 'challenge-shown':
            onShown();
            metricsService.fireDisplayedEvent();
            eventService.sendCaptchaInitiatedEvent(
              actionType,
              EVENT_CONSTANTS.captchaInitiatedChallengeType.visible,
              captchaElementEvent.payload.captchaToken,
              unifiedCaptchaId,
              null,
              FUNCAPTCHA_VERSION_V2
            );
            break;
          case 'challenge-resize':
            if (captchaElement.current !== null) {
              captchaElement.current.height = captchaElementEvent.payload.height;
              captchaElement.current.width = captchaElementEvent.payload.width;
            }
            break;
          case 'challenge-suppressed':
            metricsService.fireSuppressedEvent();
            eventService.sendCaptchaInitiatedEvent(
              actionType,
              EVENT_CONSTANTS.captchaInitiatedChallengeType.hidden,
              captchaElementEvent.payload.captchaToken,
              unifiedCaptchaId,
              null,
              FUNCAPTCHA_VERSION_V2
            );
            break;
          case 'challenge-ready':
            metricsService.fireInitializedEvent();
            break;
          default:
            break;
        }
      } catch (error) {
        // `SyntaxError` is expected if `JSON.parse` fails, which happens if the
        // Arkose API code posts extraneous messages.
        if (error instanceof SyntaxError) {
          return;
        }
        metricsService.fireProviderErrorEvent();
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, 'Got bad event data:', event.data);
        eventService.sendCaptchaInitiatedEvent(
          actionType,
          EVENT_CONSTANTS.captchaInitiatedChallengeType.error,
          null,
          unifiedCaptchaId,
          String(error),
          FUNCAPTCHA_VERSION_V2
        );
      }
    };

    window.addEventListener('message', arkoseIframeListener);
    setCaptchaElementListenerReady(true);
    return () => {
      setCaptchaElementListenerReady(false);
      window.removeEventListener('message', arkoseIframeListener);
    };
  }, [
    captchaElement,
    solveStartTimeStamp,
    actionType,
    unifiedCaptchaId,
    eventService,
    metricsService,
    arkoseIframeId,
    onComplete,
    onError,
    onShown
  ]);

  /*
   * Render Properties
   */

  const encodedDataExchangeBlob = encodeURIComponent(dataExchangeBlob);
  const captchaBody = (
    // Conditional on `pageLoading` ensures that the `iframe` remains invisible
    // until we want to explicitly have it shown.
    // Once visible, the `iframe` will take up as much of its parent as it can
    // without exceeding its parent's size.
    <div className='challenge-captcha-body' style={{ height: pageLoading ? 0 : undefined }}>
      <iframe
        ref={captchaElement}
        title='Challenge'
        id='arkose-iframe'
        src={`/arkose/iframe?publicKey=${publicKey}&dataExchangeBlob=${encodedDataExchangeBlob}&arkoseIframeId=${arkoseIframeId}${queryStringToPropagate}`}
        style={{
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );

  const challengeDone = onChallengeCompletedData || onChallengeInvalidatedData;

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
      <InlineChallengeBody>
        {(pageLoading || !captchaElementListenerReady) && (
          <span className='spinner spinner-default spinner-no-margin challenge-captcha-body' />
        )}
        {captchaElementListenerReady && captchaBody}
      </InlineChallengeBody>
    </InlineChallenge>
  ) : (
    <Modal
      className='modal-modern modal-modern-challenge-captcha'
      show={(isModalVisible || !gotActiveCaptcha) && !challengeDone}
      // Since we might have passive captcha, we use this CSS hack and the
      // backdrop setting to keep the modal invisible until we have confirmed
      // active captcha.
      style={{
        display: gotActiveCaptcha ? 'block' : 'none'
      }}
      onHide={closeModal}
      backdrop={gotActiveCaptcha ? 'static' : false}>
      <Modal.Body>
        <button
          type='button'
          className='challenge-captcha-close-button'
          onClick={closeModal}
          disabled={false}>
          <span className='icon-close' />
        </button>
        {(pageLoading || !captchaElementListenerReady) && (
          <span className='spinner spinner-default spinner-no-margin challenge-captcha-body' />
        )}
        {captchaElementListenerReady && captchaBody}
      </Modal.Body>
    </Modal>
  );
};

export default CaptchaV2;
