import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import * as TwoStepVerification from '../../../../common/request/types/twoStepVerification';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import InputControl, { validateTrue } from '../../../common/inputControl';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import RememberDeviceCheckBox from '../components/rememberDeviceCheckBox';
import SupportHelp from '../components/supportHelp';
import { REGEX_CODE } from '../constants/patterns';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource
} from '../constants/resources';
import { useActiveMediaType } from '../hooks/useActiveMediaType';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { TwoStepVerificationActionType } from '../store/action';

type Props = {
  requestInFlight: boolean;
  setRequestInFlight: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A container element for the Authenticator code input UI.
 */
const AuthenticatorInput: React.FC<Props> = ({
  requestInFlight,
  setRequestInFlight,
  children
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      shouldShowRememberDeviceCheckbox,
      metadata,
      resources,
      eventService,
      metricsService,
      requestService
    },
    dispatch
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();

  /*
   * Component State
   */

  const [code, setCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);

  const verifyCode = async () => {
    setRequestInFlight(true);
    setRequestError(null);

    eventService.sendCodeSubmittedEvent(activeMediaType, actionType);

    const result = await requestService.twoStepVerification.verifyAuthenticatorCode(userId, {
      challengeId,
      actionType,
      code
    });
    if (result.isError) {
      eventService.sendCodeVerificationFailedEvent(
        activeMediaType,
        actionType,
        TwoStepVerification.TwoStepVerificationError[
          result.error || TwoStepVerification.TwoStepVerificationError.UNKNOWN
        ]
      );
      if (
        result.error === TwoStepVerification.TwoStepVerificationError.INVALID_USER_ID ||
        result.error === TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID
      ) {
        dispatch({
          type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error)
        });
        return;
      }

      setRequestInFlight(false);
      setRequestError(mapTwoStepVerificationErrorToResource(resources, result.error));
      return;
    }

    eventService.sendCodeVerifiedEvent(activeMediaType, actionType);
    metricsService.fireVerifiedEvent(activeMediaType);

    dispatch({
      type: TwoStepVerificationActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        verificationToken: result.value.verificationToken,
        rememberDevice
      }
    });
  };

  /*
   * Render Properties
   */

  const codeValid = codeError === null && code.length === metadata?.authenticatorCodeLength;

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.Verify
    ),
    label: resources.Action.Verify,
    enabled: !requestInFlight && codeValid,
    action: verifyCode
  };

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomClassName = renderInline
    ? 'inline-challenge-margin-bottom'
    : 'modal-margin-bottom';
  const marginBottomXLargeClassName = renderInline
    ? 'inline-challenge-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';

  /*
   * Component Markup
   */

  return (
    metadata && (
      <React.Fragment>
        <BodyElement>
          <div className={lockIconClassName} />
          <p className={marginBottomXLargeClassName}>{resources.Label.EnterAuthenticatorCode}</p>

          <InputControl
            id='two-step-verification-code-input'
            inputType='text'
            disabled={requestInFlight}
            value={code}
            setValue={setCode}
            error={requestError || codeError}
            setError={setCodeError}
            validate={validateTrue}
            canSubmit={codeValid}
            handleSubmit={verifyCode}
            onChange={clearRequestError}
            // Optional parameters:
            inputMode='numeric'
            autoComplete='off'
            placeholder={resources.Label.CodeInputPlaceholderText(metadata.authenticatorCodeLength)}
            maxLength={metadata.authenticatorCodeLength}
            validCharactersRegEx={REGEX_CODE}
            hideFeedback
            concealInput
            autoFocus
          />

          {shouldShowRememberDeviceCheckbox && (
            <RememberDeviceCheckBox
              disabled={requestInFlight}
              rememberDevice={rememberDevice}
              setRememberDevice={setRememberDevice}
              className={marginBottomXLargeClassName}
            />
          )}

          {children}
        </BodyElement>
        <FooterElement positiveButton={positiveButton} negativeButton={null}>
          <SupportHelp className={marginBottomClassName} />
          <p className='text-footer'>{resources.Description.SecurityWarningShort}</p>
        </FooterElement>
      </React.Fragment>
    )
  );
};

export default AuthenticatorInput;
