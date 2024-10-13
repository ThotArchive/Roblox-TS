import React, { useEffect, useState } from 'react';
import { Endpoints } from 'Roblox';
import { Modal } from 'react-style-guide';
import {
  AnswerPrompt,
  AnswerPromptWithData,
  QuestionType,
  SecurityQuestionsError
} from '../../../../common/request/types/securityQuestions';
import { IconFormat, ProcessingState } from '../../../../common/request/types/thumbnails';
import sleep from '../../../../common/sleep';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { SECURITY_NOTIFICATION_PATH } from '../app.config';
import AnswerChoiceView from '../components/answerChoiceView';
import {
  mapGamesErrorToResource,
  mapSecurityQuestionsErrorToChallengeErrorCode,
  mapSecurityQuestionsErrorToResource,
  mapThumbnailsErrorToResource
} from '../constants/resources';
import { AnswerState } from '../constants/types';
import useSecurityQuestionsContext from '../hooks/useSecurityQuestionsContext';
import { ErrorCode } from '../interface';
import { SecurityQuestionsActionType } from '../store/action';

const NEW_QUESTION_SLEEP_TIME_MILLISECONDS = 250;

/**
 * A container element for the Security Questions UI. For now, we lump most
 * business logic into this component; in the future, different question types
 * might get split out.
 *
 * TODO: Consider splitting this component up if it gets much larger.
 */
const SecurityQuestions: React.FC = () => {
  const {
    state: {
      userId,
      sessionId,
      renderInline,
      resources,
      eventService,
      metricsService,
      requestService,
      onModalChallengeAbandoned,
      isModalVisible
    },
    dispatch
  } = useSecurityQuestionsContext();

  /*
   * Component State
   */

  const [questionType, setQuestionType] = useState<QuestionType | null>();
  const [answerPromptWithData, setAnswerPromptWithData] = useState<AnswerPromptWithData | null>(
    null
  );
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lastAnswerIncorrect, setLastAnswerIncorrect] = useState<boolean>(false);
  const [userWasForceReset, setUserWasForceReset] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const clearQuestion = () => {
    setQuestionType(null);
    setAnswerPromptWithData(null);
    setAnswerState(null);
  };

  const closeModal = () => {
    dispatch({
      type: SecurityQuestionsActionType.HIDE_MODAL_CHALLENGE
    });
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: SecurityQuestionsActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  };

  const setSelectedForId = (id: string) => (selected: boolean) => {
    if (answerState === null || answerState[id] === undefined) {
      return;
    }

    setAnswerState({
      ...answerState,
      [id]: {
        ...answerState[id],
        selected
      }
    });
  };

  // Forward declaration of `loadChallenge` for use in `checkAnswer`.
  let loadChallenge: () => Promise<void>;
  const checkAnswer = async () => {
    if (answerState === null) {
      return;
    }

    // Extract selected answer choices.
    const answerChoices = Object.entries(answerState)
      .filter(([, choice]) => choice.selected)
      .map(([id]) => id);

    // Check answer.
    setRequestInFlight(true);
    const result = await requestService.securityQuestions.answerQuestion(
      userId,
      answerChoices,
      sessionId
    );

    // Request failure is either an unknown error (show error) or session
    // inactive (invalidate challenge).
    if (result.isError) {
      if (result.error === SecurityQuestionsError.SESSION_INACTIVE) {
        dispatch({
          type: SecurityQuestionsActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapSecurityQuestionsErrorToChallengeErrorCode(result.error)
        });
        return;
      }

      metricsService.fireErroredEvent();
      setRequestError(
        `${mapSecurityQuestionsErrorToResource(resources, result.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    // Handle request success. Note that a successful request also encompasses
    // wrong answers that were otherwise valid requests.
    setRequestError(null);
    if (result.value.answerCorrect) {
      // CASE: Answer correct; complete challenge.
      metricsService.fireSolvedEvent();
      dispatch({
        type: SecurityQuestionsActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          redemptionToken: result.value.redemptionToken
        }
      });
    } else if (result.value.shouldRequestNewQuestion) {
      // CASE: Answer incorrect; request new question.
      metricsService.fireIncorrectEvent();
      clearQuestion();
      // Sleep for a second to achieve a less abrupt UI transition.
      await sleep(NEW_QUESTION_SLEEP_TIME_MILLISECONDS);
      setLastAnswerIncorrect(true);
      await loadChallenge();
      setRequestInFlight(false);
    } else if (result.value.userWasForceReset) {
      // CASE: User failed the challenge and was force-reset.
      metricsService.fireFailedEvent();
      setUserWasForceReset(true);
    } else {
      // CASE: User failed the challenge but could not be force-reset, so we
      // immediately announce the challenge as invalidated and display an opaque
      // error.
      metricsService.fireErroredEvent();
      metricsService.fireFailedEvent();
      dispatch({
        type: SecurityQuestionsActionType.SET_CHALLENGE_INVALIDATED,
        errorCode: ErrorCode.UNKNOWN
      });
    }
  };

  const redirectAfterForceReset = () => {
    // Redirect user to Security Notification page. No need to invalidate the
    // challenge since we are sending the user elsewhere.
    window.location.href = Endpoints.getAbsoluteUrl(SECURITY_NOTIFICATION_PATH);
  };

  /*
   * Effects
   */

  loadChallenge = async () => {
    setPageLoadError(null);

    // Retrieve question for current user and session.
    const resultGetQuestion = await requestService.securityQuestions.getQuestion(userId, sessionId);
    if (resultGetQuestion.isError) {
      if (resultGetQuestion.error === SecurityQuestionsError.SESSION_INACTIVE) {
        dispatch({
          type: SecurityQuestionsActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapSecurityQuestionsErrorToChallengeErrorCode(resultGetQuestion.error)
        });
      } else {
        setPageLoadError(
          `${mapSecurityQuestionsErrorToResource(resources, resultGetQuestion.error)} ${
            resources.Action.PleaseTryAgain
          }`
        );
      }
      return;
    }

    // Set the retrieved question type.
    setQuestionType(resultGetQuestion.value.questionType);

    // Set the retrieved answer prompt (with any additional metadata like
    // items to pick).
    if (resultGetQuestion.value.answerPrompt === AnswerPrompt.PICK_ALL_CORRECT_CHOICES) {
      setAnswerPromptWithData({ answerPrompt: AnswerPrompt.PICK_ALL_CORRECT_CHOICES });
    } else {
      setAnswerPromptWithData({
        answerPrompt: AnswerPrompt.PICK_C_CORRECT_CHOICES,
        correctAnswerChoiceCount: resultGetQuestion.value.correctAnswerChoiceCount
      });
    }

    // Construct an answer state from the retrieved answer choices.
    const newAnswerState: AnswerState = {};
    const answerChoiceIds = resultGetQuestion.value.answerChoices;
    const answerChoicesWithNoCaptionSet = new Set(answerChoiceIds);
    const answerChoicesWithNoIconSet = new Set(answerChoiceIds);

    // Retrieve captions to populate the answer state (in the future, this
    // may involve different logic by question type).
    const resultGetDetails = await requestService.games.getDetailsForUniverseIds(answerChoiceIds);
    if (resultGetDetails.isError) {
      setPageLoadError(
        `${mapGamesErrorToResource(resources, resultGetDetails.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      return;
    }
    const universeIdToCaption: Record<string, string> = {};
    resultGetDetails.value.data.forEach(detail => {
      universeIdToCaption[detail.id] = detail.name;
      answerChoicesWithNoCaptionSet.delete(detail.id.toString());
    });

    // Retrieve image URLs to populate the answer state (in the future, this
    // may involve different logic by question type).
    const resultGetIcons = await requestService.thumbnails.getIconsForUniverseIds(
      answerChoiceIds,
      '256x256',
      IconFormat.PNG,
      false
    );
    if (resultGetIcons.isError) {
      setPageLoadError(
        `${mapThumbnailsErrorToResource(resources, resultGetIcons.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      return;
    }
    const universeIdToImageUrl: Record<string, string> = {};
    resultGetIcons.value.data.forEach(icon => {
      if (icon.state === ProcessingState.COMPLETED) {
        universeIdToImageUrl[icon.targetId] = icon.imageUrl;
        answerChoicesWithNoIconSet.delete(icon.targetId.toString());
      }
    });

    // Populate and set the new answer state.
    answerChoiceIds.forEach(id => {
      newAnswerState[id] = {
        caption: universeIdToCaption[id] || null,
        imageUrl: universeIdToImageUrl[id] || null,
        selected: false
      };
    });
    setAnswerState(newAnswerState);

    // Send an event for any answer choices with no caption or icon. This
    // should not occur and may indicate a problem with the data pipeline.
    if (answerChoicesWithNoCaptionSet.size > 0 || answerChoicesWithNoIconSet.size > 0) {
      eventService.sendAnswerChoicesFailedToLoadEvent(
        Array.from(answerChoicesWithNoCaptionSet),
        Array.from(answerChoicesWithNoIconSet)
      );
    }
  };

  // Challenge loading effect:
  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadChallenge();
    return () => {
      clearQuestion();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Render Properties
   */

  const selectionCount =
    answerState !== null
      ? Object.entries(answerState).filter(([, choice]) => choice.selected).length
      : 0;
  const enoughSelectionsMade =
    answerPromptWithData !== null &&
    (answerPromptWithData.answerPrompt === AnswerPrompt.PICK_ALL_CORRECT_CHOICES ||
      answerPromptWithData.correctAnswerChoiceCount === selectionCount);

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.Confirm
    ),
    label: resources.Action.Confirm,
    enabled: !requestInFlight && enoughSelectionsMade,
    action: checkAnswer
  };

  const reloadButton: FooterButtonConfig = {
    content: resources.Action.Reload,
    label: resources.Action.Reload,
    enabled: pageLoadError !== null,
    action: loadChallenge
  };

  const redirectAfterForceResetButton: FooterButtonConfig = {
    content: resources.Action.Continue,
    label: resources.Action.Continue,
    enabled: true,
    action: redirectAfterForceReset
  };

  /*
   * Rendering Helpers
   */

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
    const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
    const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
    const marginBottomSmallClassName = renderInline
      ? 'inline-challenge-margin-bottom-sm'
      : 'modal-margin-bottom-sm';
    const marginBottomClassName = renderInline
      ? 'inline-challenge-margin-bottom'
      : 'modal-margin-bottom';
    const marginBottomXLargeClassName = renderInline
      ? 'inline-challenge-margin-bottom-xlarge'
      : 'modal-margin-bottom-xlarge';

    // User was force reset:
    if (userWasForceReset) {
      return (
        <React.Fragment>
          <BodyElement>
            <div className={lockIconClassName} />
            <p className={`${marginBottomClassName} font-bold`}>
              {resources.Description.YourPasswordHasBeenReset}
            </p>
            <p
              // IMPORTANT: Do not inject user input here.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: resources.Description.RegainAccessGeneric(
                  `<span class="font-bold">${resources.Action.Continue}</span>`
                )
              }}
            />
          </BodyElement>
          <FooterElement positiveButton={redirectAfterForceResetButton} negativeButton={null} />
        </React.Fragment>
      );
    }

    // Show an error if we could not load answer choice info.
    if (pageLoadError !== null) {
      return (
        <React.Fragment>
          <BodyElement>
            <p>{pageLoadError}</p>
          </BodyElement>
          <FooterElement positiveButton={reloadButton} negativeButton={null} />
        </React.Fragment>
      );
    }

    // Page still loading:
    if (questionType === null || answerPromptWithData === null || answerState === null) {
      return (
        <BodyElement>
          <span className='spinner spinner-default spinner-no-margin modal-margin-bottom-large' />
        </BodyElement>
      );
    }

    // Break the last 2 lines into a 2-by-2 grid if we would otherwise have a
    // single answer choice on the last line (looks better visually).
    const wouldSpillOverSingleChoice = Object.keys(answerState).length % 3 === 1;

    return (
      <React.Fragment>
        <BodyElement>
          <div className={lockIconClassName} />
          <p className={marginBottomSmallClassName}>{resources.Description.WhichGames}</p>
          <p className={`${marginBottomXLargeClassName} font-bold`}>
            {answerPromptWithData.answerPrompt === AnswerPrompt.PICK_ALL_CORRECT_CHOICES
              ? resources.Action.SelectAllThatApply
              : resources.Action.PickN(answerPromptWithData.correctAnswerChoiceCount)}
          </p>
          <p
            className={`${
              // We add an error text below this if the last answer was incorrect.
              lastAnswerIncorrect ? marginBottomSmallClassName : marginBottomXLargeClassName
            } small`}>
            {resources.Description.VerifyYourIdentity}
          </p>
          {lastAnswerIncorrect && (
            <p className={`${marginBottomXLargeClassName} text-error`}>
              {resources.Message.Error.AnswerIncorrect} {resources.Action.PleaseTryAgain}
            </p>
          )}
          <div className={`${marginBottomXLargeClassName} answer-choice-area`}>
            {Object.keys(answerState).map((id, i) => (
              <React.Fragment key={id}>
                <AnswerChoiceView
                  key={id}
                  setSelected={setSelectedForId(id)}
                  {...answerState[id]}
                />
                {wouldSpillOverSingleChoice && i === Object.keys(answerState).length - 3 ? (
                  <br />
                ) : null}
              </React.Fragment>
            ))}
          </div>
          <p className='text-error xsmall'>{requestError}</p>
        </BodyElement>
        <FooterElement positiveButton={positiveButton} negativeButton={null} />
      </React.Fragment>
    );
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={resources.Header.PleaseConfirmYourIdentity}>
      {getPageContent()}
    </InlineChallenge>
  ) : (
    <Modal className='modal-modern' show={isModalVisible} onHide={closeModal} backdrop='static'>
      <FragmentModalHeader
        headerText={resources.Header.PleaseConfirmYourIdentity}
        buttonType={userWasForceReset ? HeaderButtonType.HIDDEN : HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};

export default SecurityQuestions;
