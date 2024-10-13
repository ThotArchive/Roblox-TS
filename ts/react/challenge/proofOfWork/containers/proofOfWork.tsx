import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ProgressBar } from 'react-style-guide';
import { localStorageService } from 'core-roblox-utilities';
import {
  TimeLockPuzzleMessage,
  TimeLockPuzzleParameters,
  TimeLockPuzzleSolver
} from '../../../../common/algorithm/proofOfWork/timeLockPuzzleSolver';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { mapProofOfWorkErrorToChallengeErrorCode } from '../constants/resources';
import { AnswerState } from '../constants/types';
import useProofOfWorkContext from '../hooks/useProofOfWorkContext';
import { ErrorCode } from '../interface';
import { ProofOfWorkActionType } from '../store/action';
import timeLockPuzzle from '../worker/timeLockPuzzle';
import { SolverParameters, SolverType } from '../../../../common/algorithm/solverCommon';
import {
  PROGRESS_DISPLAY_PERCENTAGE_PRECISION,
  VISIBILITY_DELAY_MILLISECONDS,
  PROGRESS_CHECK_ENABLE,
  PROGRESS_CHECK_MINIMUM_PROGRESS,
  PROGRESS_CHECK_PERIOD_MILLISECONDS,
  SESSION_ID_KEY
} from '../constants/challengeConfig';

/**
 * Utility functions.
 */

const getProgressLabelString = (progressPercentage: number): string =>
  `${progressPercentage.toFixed(PROGRESS_DISPLAY_PERCENTAGE_PRECISION)}%`;

/**
 * A container element for the Proof-of-Work UI.
 *
 * TODO: Consider splitting this component up if it gets much larger.
 */
const ProofOfWork: React.FC = () => {
  const {
    state: {
      sessionId,
      renderInline,
      resources,
      eventService,
      metricsService,
      requestService,
      onChallengeDisplayed,
      isModalVisible
    },
    dispatch
  } = useProofOfWorkContext();

  /*
   * Component State
   */

  const [puzzleArtifact, setPuzzleArtifact] = useState<string | null>(null);
  const [puzzleSolution, setPuzzleSolution] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.INITIAL);
  const [progress, setProgress] = useState<number>(0);

  // Mutable state to hold the initialized Web Worker:
  const worker = useRef<Worker | null>(null);

  // Mutable state to hold the fallback puzzle worker; only when web worker is
  // not available on browsers.
  const fallbackSolver = useRef<TimeLockPuzzleSolver | null>(null);

  // Mutable state to hold the visibility timer.
  const visibilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mutable state to hold the current and last progress (as refs).
  const curProgress = useRef<number>(0);
  const lastProgress = useRef<number>(0);

  /*
   * Event Handlers
   */

  const setVisibilityTimer = useCallback(() => {
    visibilityTimer.current = setTimeout(() => {
      dispatch({
        type: ProofOfWorkActionType.SHOW_MODAL_CHALLENGE
      });
      onChallengeDisplayed({ displayed: true });
    }, VISIBILITY_DELAY_MILLISECONDS);
  }, [dispatch, onChallengeDisplayed]);

  const clearVisibilityTimer = () => {
    clearTimeout(visibilityTimer.current || undefined);
  };

  const resetChallengeState = () => {
    clearVisibilityTimer();

    if (worker.current) {
      worker.current.terminate();
      worker.current = null;
    }
    if (fallbackSolver.current) {
      fallbackSolver.current.cancelRunAsync();
      fallbackSolver.current = null;
    }

    setPuzzleArtifact(null);
    setPuzzleSolution(null);
    setAnswerState(AnswerState.INITIAL);
  };

  const closeModal = () =>
    dispatch({
      type: ProofOfWorkActionType.HIDE_MODAL_CHALLENGE
    });

  const terminateComputationAndCloseModal = () => {
    dispatch({
      type: ProofOfWorkActionType.SET_CHALLENGE_ABANDONED
    });
    resetChallengeState();
    closeModal();
  };

  const timeoutComputationAndCloseModal = () => {
    dispatch({
      type: ProofOfWorkActionType.SET_CHALLENGE_TIMEOUT
    });
    resetChallengeState();
    closeModal();
  };

  const checkProgress = () => {
    if (curProgress.current === 1 || !PROGRESS_CHECK_ENABLE) {
      return;
    }

    if (curProgress.current < lastProgress.current + PROGRESS_CHECK_MINIMUM_PROGRESS) {
      timeoutComputationAndCloseModal();
      return;
    }

    lastProgress.current = curProgress.current;
    setTimeout(checkProgress, PROGRESS_CHECK_PERIOD_MILLISECONDS);
  };

  const solvePuzzle = () => {
    if (puzzleArtifact == null || answerState !== AnswerState.READY_TO_COMPUTE) {
      setAnswerState(AnswerState.VERIFIED_INCORRECT);
      dispatch({
        type: ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.UNKNOWN,
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
      closeModal();
      return;
    }

    const parameters = JSON.parse(puzzleArtifact) as TimeLockPuzzleParameters;
    if (worker.current == null) {
      // If the worker is not initialized properly, run in fallback mode.
      fallbackSolver.current = new TimeLockPuzzleSolver(parameters);
      setAnswerState(AnswerState.COMPUTING);
      fallbackSolver.current.runAsync(
        // Progress callback:
        (newProgress: number) => {
          setProgress(newProgress);
          curProgress.current = newProgress;
        },
        // Answer callback:
        (answer: string | null) => {
          setPuzzleSolution(answer);
          setAnswerState(AnswerState.COMPUTING_DONE);
        }
      );
      setTimeout(checkProgress, PROGRESS_CHECK_PERIOD_MILLISECONDS);
      return;
    }

    setAnswerState(AnswerState.COMPUTING);
    worker.current.onmessage = (event: MessageEvent<TimeLockPuzzleMessage>) => {
      // Some older browsers send Worker messages as strings.
      const message =
        typeof event.data === 'object'
          ? event.data
          : (JSON.parse(event.data) as TimeLockPuzzleMessage);
      setProgress(message.progress);
      curProgress.current = message.progress;
      if (message.answer) {
        setPuzzleSolution(message.answer);
        setAnswerState(AnswerState.COMPUTING_DONE);
      }
    };
    worker.current.postMessage(
      JSON.stringify({
        solverType: SolverType.TIME_LOCK_PUZZLE,
        solverParameters: parameters
      } as SolverParameters<SolverType.TIME_LOCK_PUZZLE>)
    );
    setTimeout(checkProgress, PROGRESS_CHECK_PERIOD_MILLISECONDS);
  };

  const checkAnswer = async () => {
    if (puzzleSolution == null) {
      return;
    }
    const result = await requestService.proofOfWork.verifyPuzzle(sessionId, puzzleSolution);

    // Return back to the caller in all error cases.
    if (result.isError) {
      dispatch({
        type: ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: mapProofOfWorkErrorToChallengeErrorCode(result.error),
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
      return;
    }

    // CASE: Correct answer.
    if (result.value.answerCorrect) {
      // CASE: Answer correct; complete challenge.
      setAnswerState(AnswerState.VERIFIED_CORRECT);
      dispatch({
        type: ProofOfWorkActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          redemptionToken: result.value.redemptionToken
        }
      });
    } else {
      // CASE: Incorrect answer
      setAnswerState(AnswerState.VERIFIED_INCORRECT);
      dispatch({
        type: ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.ANSWER_INVALID,
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
    }
  };

  const loadChallenge = async () => {
    resetChallengeState();
    try {
      worker.current = timeLockPuzzle();
    } catch (error) {
      worker.current = null;
    }

    const resultGetPuzzle = await requestService.proofOfWork.getPuzzle(sessionId);
    if (resultGetPuzzle.isError) {
      dispatch({
        type: ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.UNKNOWN,
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
      closeModal();
      return;
    }
    setPuzzleArtifact(resultGetPuzzle.value.artifacts);
    setAnswerState(AnswerState.READY_TO_COMPUTE);
  };

  const handleAnswerStateChange = async () => {
    switch (answerState) {
      case AnswerState.READY_TO_COMPUTE: {
        eventService.sendPuzzleInitializedEvent();
        metricsService.firePuzzleInitializedEvent();
        setVisibilityTimer();
        solvePuzzle();
        break;
      }
      case AnswerState.COMPUTING_DONE: {
        eventService.sendPuzzleCompletedEvent();
        metricsService.firePuzzleCompletedEvent();
        await checkAnswer();
        resetChallengeState();
        closeModal();
        break;
      }
      default: {
        break;
      }
    }
  };

  /*
   * Effects
   */

  // Challenge loading effect:
  useEffect(() => {
    // Check if the component with the same session id has initialized the challenge flow previously,
    // if so then we quit early, if not then we will memoize it in the local storage.
    const currentSessionId = localStorageService.getLocalStorage(SESSION_ID_KEY) as
      | string
      | undefined;
    if (sessionId === currentSessionId) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    localStorageService.setLocalStorage(SESSION_ID_KEY, sessionId);
    eventService.sendChallengeInitializedEvent();
    metricsService.fireChallengeInitializedEvent();

    // eslint-disable-next-line no-void
    void loadChallenge();
    return resetChallengeState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void handleAnswerStateChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerState]);

  /*
   * Rendering Helpers
   */

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
    const progressPercentage = (progress || 0) * 100;

    return (
      <React.Fragment>
        <BodyElement>
          <div className='computation-progress-body'>
            <ProgressBar
              now={progressPercentage}
              label={getProgressLabelString(progressPercentage)}
              striped
            />
          </div>
        </BodyElement>
      </React.Fragment>
    );
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
      {getPageContent()}
    </InlineChallenge>
  ) : (
    <Modal
      className='modal-modern modal-modern-challenge-computation-progress'
      show={isModalVisible}
      onHide={terminateComputationAndCloseModal}
      backdrop='static'>
      <FragmentModalHeader
        headerText={resources.Description.VerifyingYouAreNotBot}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={terminateComputationAndCloseModal}
        buttonEnabled
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};

export default ProofOfWork;
