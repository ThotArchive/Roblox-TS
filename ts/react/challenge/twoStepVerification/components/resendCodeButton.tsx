import React, { useState } from 'react';
import { TwoStepVerificationError } from '../../../../common/request/types/twoStepVerification';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource
} from '../constants/resources';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { TwoStepVerificationActionType } from '../store/action';
import { MediaType } from '../interface';

type Props = {
  disabled: boolean;
  setCodeError: React.Dispatch<React.SetStateAction<string | null>>;
  mediaType: MediaType | null;
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

/**
 * A button to trigger re-sending a 2SV email or SMS code.
 */
const ResendCodeButton: React.FC<Props> = ({
  disabled,
  setCodeError,
  mediaType,
  className
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      resources,
      eventService,
      requestService
    },
    dispatch
  } = useTwoStepVerificationContext();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  const resendCode = async () => {
    let sendCodeError: TwoStepVerificationError | null = null;
    setRequestInFlight(true);

    if (mediaType === MediaType.Email) {
      eventService.sendEmailResendRequestedEvent();
      const emailResult = await requestService.twoStepVerification.sendEmailCode(userId, {
        challengeId,
        actionType
      });
      if (emailResult.isError) {
        sendCodeError = emailResult.error;
      }
    } else if (mediaType === MediaType.SMS) {
      eventService.sendSmsResendRequestedEvent();
      const smsResult = await requestService.twoStepVerification.sendSmsCode(userId, {
        challengeId,
        actionType
      });
      if (smsResult.isError) {
        sendCodeError = smsResult.error;
      }
    }

    setRequestInFlight(false);
    if (sendCodeError != null) {
      if (
        sendCodeError === TwoStepVerificationError.INVALID_USER_ID ||
        sendCodeError === TwoStepVerificationError.INVALID_CHALLENGE_ID
      ) {
        dispatch({
          type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(sendCodeError)
        });
      } else {
        setCodeError(mapTwoStepVerificationErrorToResource(resources, sendCodeError));
      }
    }
  };

  if (requestInFlight) {
    return (
      <p className={className}>
        <span className='spinner spinner-xs spinner-no-margin' />
      </p>
    );
  }

  const buttonLinkClassName = renderInline
    ? 'inline-challenge-body-button-link'
    : 'modal-body-button-link';

  return (
    <p className={className}>
      <button
        type='button'
        className={`${buttonLinkClassName} small`}
        onClick={resendCode}
        disabled={disabled || requestInFlight}>
        {resources.Action.Resend}
      </button>
    </p>
  );
};

export default ResendCodeButton;
