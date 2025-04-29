import { localStorageService } from 'core-roblox-utilities';
import { httpResponseCodes } from 'core-utilities';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { mapPrivateAccessTokenErrorToChallengeErrorCode } from '../constants/resources';
import { AnswerState } from '../constants/types';
import usePrivateAccessTokenContext from '../hooks/usePrivateAccessTokenContext';
import { PrivateAccessTokenActionType } from '../store/action';

/**
 * A container element for the Private-Access-Token challenge.
 */
const PrivateAccessToken: React.FC = () => {
  const {
    state: { renderInline, challengeId, resources, requestService, metricsService, eventService },
    dispatch
  } = usePrivateAccessTokenContext();

  /*
   * Component State
   */
  const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.INITIAL);

  /*
   * Challenge session identifier key.
   */
  const CHALLENGE_ID_KEY = 'ChallengeId';

  /*
   * Event Handlers
   */
  const checkAnswer = useCallback(async () => {
    if (answerState !== AnswerState.INITIAL) {
      // The answer state is not in desired state to start with, early exit.
      return;
    }
    // Check if the component with the same challenge id has tried to redeem PAT token previously,
    // if so then we opt to not duplicate the request,
    // if not then we will memoize it in the local storage.
    const currentChallengeId = localStorageService.getLocalStorage(CHALLENGE_ID_KEY) as
      | string
      | undefined;
    if (challengeId === currentChallengeId) {
      return;
    }
    localStorageService.setLocalStorage(CHALLENGE_ID_KEY, challengeId);

    const result = await requestService.privateAccessToken.getPatToken(challengeId);

    if (result.isError) {
      // CASE: getPATToken yields a 401 status indicating device/platform is not supporting PAT.
      // Pass empty redemption token for verification.
      if (result.errorStatusCode === httpResponseCodes.unauthorized) {
        setAnswerState(AnswerState.COMPLETED_SUCCESS);
        dispatch({
          type: PrivateAccessTokenActionType.SET_CHALLENGE_COMPLETED,
          onChallengeCompletedData: {
            redemptionToken: ''
          }
        });
        eventService.sendChallengeCompletedEvent(false);
        metricsService.fireChallengeCompletedEvent();
        return;
      }
      // CASE: getPATToken yields an error. Log error based on code.
      setAnswerState(AnswerState.COMPLETED_ERROR);
      dispatch({
        type: PrivateAccessTokenActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: mapPrivateAccessTokenErrorToChallengeErrorCode(result.error),
          errorMessage: resources.Description.VerificationError
        }
      });
    } else {
      // CASE: getPATToken returns redemption token. Handles successful completion of challenge.
      setAnswerState(AnswerState.COMPLETED_SUCCESS);
      eventService.sendChallengeCompletedEvent(true);
      metricsService.fireChallengeCompletedEvent();
      dispatch({
        type: PrivateAccessTokenActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          redemptionToken: result.value.redemptionToken
        }
      });
    }
  }, [
    resources,
    dispatch,
    requestService.privateAccessToken,
    answerState,
    metricsService,
    eventService,
    challengeId
  ]);

  /*
   * Effects
   */

  // Challenge loading effect:
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkAnswer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Note: For the Private Access Token challenge, we do not have a UI component
  // to render except for the loading snippet.
  return renderInline ? (
    <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
      <InlineChallengeBody>
        <span className='spinner spinner-default spinner-no-margin' />
      </InlineChallengeBody>
    </InlineChallenge>
  ) : (
    <Modal className='modal-modern' backdrop='static'>
      <Modal.Body>
        <span className='spinner spinner-default spinner-no-margin' />
      </Modal.Body>
    </Modal>
  );
};

export default PrivateAccessToken;
