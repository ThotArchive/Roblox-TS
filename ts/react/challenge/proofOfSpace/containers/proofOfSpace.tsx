import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ProgressBar } from 'react-style-guide';
import { localStorageService } from 'core-roblox-utilities';
import {
  GraphPebblingPuzzleAnswer,
  GraphPebblingPuzzleMessage,
  GraphPebblingPuzzleParameters,
  GraphPebblingPuzzleSolver
} from '../../../../common/algorithm/proofOfSpace/graphPebblingPuzzleSolver';
import { SolverParameters, SolverType } from '../../../../common/algorithm/solverCommon';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import {
  CHALLENGE_ID_KEY,
  PROGRESS_CHECK_MINIMUM_PROGRESS,
  PROGRESS_CHECK_PERIOD_MILLISECONDS,
  PROGRESS_DISPLAY_PERCENTAGE_PRECISION,
  VISIBILITY_DELAY_MILLISECONDS
} from '../constants/challengeConfig';
import { AnswerState } from '../constants/types';
import { mapProofOfSpaceErrorToChallengeErrorCode } from '../constants/resources';
import useProofOfSpaceContext from '../hooks/useProofOfSpaceContext';
import { ErrorCode } from '../interface';
import { ProofOfSpaceActionType } from '../store/action';
import graphPebblingPuzzle from '../worker/graphPebblingPuzzle';
import { LOG_PREFIX } from '../app.config';

/**
 * Utility functions.
 */

const getProgressLabelString = (progressPercentage: number): string =>
  `${progressPercentage.toFixed(PROGRESS_DISPLAY_PERCENTAGE_PRECISION)}%`;

/**
 * A container element for the Proof-of-Space UI.
 *
 * Matches that of the Proof-of-Work challenge.
 */
const ProofOfSpace: React.FC = () => {
  const {
    state: {
      challengeId,
      artifacts,
      renderInline,
      resources,
      eventService,
      metricsService,
      requestService,
      onChallengeDisplayed,
      isModalVisible
    },
    dispatch
  } = useProofOfSpaceContext();

  /*
   * Component State
   */

  const [puzzleSolution, setPuzzleSolution] = useState<GraphPebblingPuzzleAnswer | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.INITIAL);
  const [progress, setProgress] = useState<number>(0);

  // Mutable state to hold the initialized Web Worker:
  const worker = useRef<Worker | null>(null);

  // Mutable state to hold the fallback puzzle worker; only when web worker is
  // not available on browsers.
  const fallbackSolver = useRef<GraphPebblingPuzzleSolver | null>(null);

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
        type: ProofOfSpaceActionType.SHOW_MODAL_CHALLENGE
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

    setPuzzleSolution(null);
    setAnswerState(AnswerState.INITIAL);
  };

  const closeModal = () =>
    dispatch({
      type: ProofOfSpaceActionType.HIDE_MODAL_CHALLENGE
    });

  const terminateComputationAndCloseModal = () => {
    dispatch({
      type: ProofOfSpaceActionType.SET_CHALLENGE_ABANDONED
    });
    resetChallengeState();
    closeModal();
  };

  const timeoutComputationAndCloseModal = () => {
    dispatch({
      type: ProofOfSpaceActionType.SET_CHALLENGE_TIMEOUT,
      progress: curProgress.current
    });
    resetChallengeState();
    closeModal();
  };

  const checkProgress = () => {
    if (curProgress.current === 1) {
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
    if (answerState !== AnswerState.READY_TO_COMPUTE) {
      setAnswerState(AnswerState.VERIFIED_INCORRECT);
      dispatch({
        type: ProofOfSpaceActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.UNKNOWN,
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
      closeModal();
      return;
    }

    const parameters: GraphPebblingPuzzleParameters = {
      seed: artifacts.seed,
      layers: parseInt(artifacts.layers, 10),
      rounds: parseInt(artifacts.rounds, 10)
    };

    if (worker.current == null) {
      // If the worker is not initialized properly, run in fallback mode.
      fallbackSolver.current = new GraphPebblingPuzzleSolver(parameters);
      setAnswerState(AnswerState.COMPUTING);
      fallbackSolver.current.runAsync(
        // Progress callback:
        (newProgress: number) => {
          setProgress(newProgress);
          curProgress.current = newProgress;
        },
        // Answer callback:
        (answer: GraphPebblingPuzzleAnswer | null) => {
          setPuzzleSolution(answer);
          setAnswerState(AnswerState.COMPUTING_DONE);
        },
        // Abort callback:
        (error: string) => {
          // eslint-disable-next-line no-console
          console.error(LOG_PREFIX, 'exception caught in fallback solver:', error);
          timeoutComputationAndCloseModal();
        }
      );
      setTimeout(checkProgress, PROGRESS_CHECK_PERIOD_MILLISECONDS);
      return;
    }

    setAnswerState(AnswerState.COMPUTING);
    worker.current.onmessage = (event: MessageEvent<GraphPebblingPuzzleMessage>) => {
      // Some older browsers send Worker messages as strings.
      const message =
        typeof event.data === 'object'
          ? event.data
          : (JSON.parse(event.data) as GraphPebblingPuzzleMessage);
      if (message.error) {
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, 'exception caught in worker:', message.error);
        timeoutComputationAndCloseModal();
        return;
      }
      setProgress(message.progress);
      curProgress.current = message.progress;
      if (message.answer) {
        setPuzzleSolution(message.answer);
        setAnswerState(AnswerState.COMPUTING_DONE);
      }
    };
    worker.current.postMessage(
      JSON.stringify({
        solverType: SolverType.GRAPH_PEBBLING_PUZZLE,
        solverParameters: parameters
      } as SolverParameters<SolverType.GRAPH_PEBBLING_PUZZLE>)
    );
    setTimeout(checkProgress, PROGRESS_CHECK_PERIOD_MILLISECONDS);
  };

  const checkAnswer = async () => {
    if (puzzleSolution == null) {
      return;
    }
    const result = await requestService.proofOfSpace.verifyPuzzle(challengeId, puzzleSolution);

    // Return back to the caller in all error cases.
    if (result.isError) {
      dispatch({
        type: ProofOfSpaceActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: mapProofOfSpaceErrorToChallengeErrorCode(result.error),
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
      return;
    }

    // CASE: Correct answer.
    if (result.value.redemptionToken) {
      // CASE: Answer correct; complete challenge.
      setAnswerState(AnswerState.VERIFIED_CORRECT);
      dispatch({
        type: ProofOfSpaceActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          redemptionToken: result.value.redemptionToken
        }
      });
    } else {
      // CASE: Incorrect answer
      setAnswerState(AnswerState.VERIFIED_INCORRECT);
      dispatch({
        type: ProofOfSpaceActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.ANSWER_INVALID,
          // TODO: More-specific error handling.
          errorMessage: resources.Description.VerificationError
        }
      });
    }
  };

  const loadChallenge = () => {
    resetChallengeState();
    try {
      worker.current = graphPebblingPuzzle();
    } catch (error) {
      worker.current = null;
    }
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
    // Check if the component with the same challenge id has initialized the challenge flow previously,
    // if so then we quit early, if not then we will memoize it in the local storage.
    const currentChallengeId = localStorageService.getLocalStorage(CHALLENGE_ID_KEY) as
      | string
      | undefined;
    if (challengeId === currentChallengeId) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    localStorageService.setLocalStorage(CHALLENGE_ID_KEY, challengeId);
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

export default ProofOfSpace;
