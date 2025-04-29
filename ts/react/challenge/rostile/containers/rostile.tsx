import { localStorageService } from 'core-roblox-utilities';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import { RostileError, Solution } from '../../../../common/request/types/rostile';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import VisiblePuzzle from '../components/rostileVisiblePuzzle';
import { challengeIdKey, modalCloseDelay } from '../constants/challengeConfig';
import { mapRostileErrorToChallengeErrorCode } from '../constants/resources';
import { AnswerState } from '../constants/types';
import useRostileContext from '../hooks/useRostileContext';
import { ErrorCode, PuzzleType } from '../interface';
import { RostileActionType } from '../store/action';

/**
 * A container element for the Rostile UI.
 */
const Rostile: React.FC = () => {
  const {
    state: {
      challengeId,
      puzzleType,
      renderInline,
      resources,
      requestService,
      eventService,
      metricsService,
      onChallengeDisplayed,
      isModalVisible
    },
    dispatch
  } = useRostileContext();

  /*
   * Component State
   */

  const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.INITIAL);

  /*
   * Challenge Logic
   */

  const resetChallengeState = () => {
    setAnswerState(AnswerState.INITIAL);
  };

  const closeModal = () => {
    dispatch({
      type: RostileActionType.HIDE_MODAL_CHALLENGE
    });
  };

  const closeModalAbandon = () => {
    resetChallengeState();
    dispatch({
      type: RostileActionType.SET_CHALLENGE_ABANDONED
    });
    closeModal();
  };

  const checkAnswer = async (solution: Solution, retryUsed = false): Promise<void> => {
    setAnswerState(AnswerState.COMPLETED_UNRESOLVED);
    const result = await requestService.rostile.verifyPuzzle(challengeId, solution);

    if (result.isError) {
      if (result.error === RostileError.INVALID_SESSION || retryUsed) {
        // CASE: HTTP request yields a session error or this is the retry.
        // Invalidate the challenge.
        setAnswerState(AnswerState.COMPLETED_ERROR);
        dispatch({
          type: RostileActionType.SET_CHALLENGE_INVALIDATED,
          onChallengeInvalidatedData: {
            errorCode: mapRostileErrorToChallengeErrorCode(result.error),
            errorMessage: resources.Description.VerificationError
          }
        });
      } else {
        // CASE: Miscellaneous error. Retry the challenge.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        return checkAnswer(solution, true);
      }
    } else {
      // CASE: Http request returns normally. Handles successful completion of
      // challenge. In this case, Rostile may think the user is a bot but the
      // frontend is oblivious to it.
      setAnswerState(AnswerState.COMPLETED_SUCCESS);
      dispatch({
        type: RostileActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          redemptionToken: result.value.redemptionToken
        }
      });
      setTimeout(() => isModalVisible && closeModal(), modalCloseDelay);
    }
    return undefined;
  };

  // TODO: Add actual logic for invisible challenge and if necessary separate
  // into own component (https://roblox.atlassian.net/browse/BNS-4963).
  const handleInvisibleSolve = async () => {
    await checkAnswer({});
  };

  /*
   * Effects
   */

  // Initialization of challenge. Show if visible. Directly resolve if
  // invisible.
  useEffect(() => {
    // Check if the component with the same challenge id has been initialized previously.
    // If so then we quit early, if not then we will memoize it in the local storage.
    const currentChallengeId = localStorageService.getLocalStorage(challengeIdKey) as
      | string
      | undefined;
    if (challengeId === currentChallengeId) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return;
    }
    localStorageService.setLocalStorage(challengeIdKey, challengeId);
    eventService.sendChallengeInitializedEvent();
    metricsService.fireChallengeInitializedEvent();

    switch (puzzleType) {
      case PuzzleType.VISIBLE:
        dispatch({
          type: RostileActionType.SHOW_MODAL_CHALLENGE
        });
        onChallengeDisplayed({ displayed: true });
        break;
      case PuzzleType.INVISIBLE:
        handleInvisibleSolve().then(
          () => undefined,
          () => undefined
        );
        break;
      default:
        dispatch({
          type: RostileActionType.SET_CHALLENGE_INVALIDATED,
          onChallengeInvalidatedData: {
            errorCode: ErrorCode.UNKNOWN,
            errorMessage: resources.Description.VerificationError
          }
        });
        if (isModalVisible) {
          closeModal();
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, onChallengeDisplayed, puzzleType]);

  /*
   * Rendering Helpers
   */

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;

    switch (puzzleType) {
      case PuzzleType.VISIBLE:
        return (
          <React.Fragment>
            <BodyElement>
              <VisiblePuzzle answerState={answerState} checkAnswer={checkAnswer} />
            </BodyElement>
          </React.Fragment>
        );
      case PuzzleType.INVISIBLE:
      default:
        return null;
    }
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge
      titleText={
        answerState !== AnswerState.COMPLETED_ERROR
          ? resources.Description.VerificationHeader
          : resources.Description.VerificationErrorHeader
      }>
      {getPageContent()}
    </InlineChallenge>
  ) : (
    <Modal
      className='modal-modern modal-modern-challenge-rostile'
      show={isModalVisible}
      onHide={answerState === AnswerState.COMPLETED_ERROR ? closeModal : closeModalAbandon}
      backdrop='static'>
      <FragmentModalHeader
        headerText={
          answerState !== AnswerState.COMPLETED_ERROR
            ? resources.Description.VerificationHeader
            : resources.Description.VerificationErrorHeader
        }
        buttonType={
          answerState === AnswerState.COMPLETED_ERROR
            ? HeaderButtonType.HIDDEN
            : HeaderButtonType.CLOSE
        }
        buttonAction={closeModalAbandon}
        buttonEnabled={answerState !== AnswerState.COMPLETED_ERROR}
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};
export default Rostile;
