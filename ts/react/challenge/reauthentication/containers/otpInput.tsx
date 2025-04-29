import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import * as Otp from '../../../../common/request/types/otp';
import { ReauthenticationError } from '../../../../common/request/types/reauthentication';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import InputControl, { validateTrue } from '../../../common/inputControl';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { CODE_SEND_INTERVAL_SECONDS, MILLIS } from '../constants/alias';
import {
  mapOtpErrorToChallengeErrorCode,
  mapReauthenticationErrorToResource,
  mapReauthenticationOtpErrorToResource
} from '../constants/resources';
import { useOtpCodeLength } from '../hooks/useOtpCodeLength';
import useReauthenticationContext from '../hooks/useReauthenticationContext';
import { ReauthenticationType } from '../interface';
import { ReauthenticationActionType } from '../store/action';

type Props = {
  otpResendCodeRemainingTimeState: [number, React.Dispatch<React.SetStateAction<number>>];
  requestInFlightState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  requestErrorState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
  children?: ReactNode;
};

/**
 * A component to handle OTP input for Reauth.
 */

const OtpInput: React.FC<Props> = ({
  otpResendCodeRemainingTimeState,
  requestInFlightState,
  requestErrorState,
  children
}) => {
  const {
    state: {
      renderInline,
      resources,
      requestService,
      metricsService,
      eventService,
      initialOtpSessionId
    },
    dispatch
  } = useReauthenticationContext();

  /*
   * Component State
   */

  const otpCodeLength = useOtpCodeLength();
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSessionId, setOtpSessionId] = useState<string | null>(initialOtpSessionId);
  const [
    otpResendCodeRemainingTime,
    setOtpResendCodeRemainingTime
  ] = otpResendCodeRemainingTimeState;
  const [otpResendCodeIntervalId, setOtpResendCodeIntervalId] = useState<number | null>(null);
  const [requestInFlight, setRequestInFlight] = requestInFlightState;
  const [requestError, setRequestError] = requestErrorState;

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);
  const verifyOtpCode = useCallback(async () => {
    setRequestInFlight(true);

    if (otpSessionId === null) {
      // TODO (ACCSEC-1181): Emit a metric to alert on.
      setRequestError(
        `${mapReauthenticationErrorToResource(resources, ReauthenticationError.UNKNOWN)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    eventService.sendCodeSubmittedEvent(ReauthenticationType.OtpEmail);
    // Continue the validation half of the OTP flow.
    const otpValidateResult = await requestService.otp.validateCode(
      Otp.ContactTypes.Email,
      otpSessionId,
      otpCode
    );

    // Request failures on this endpoint are considered transient (the requests
    // can be tried again, potentially after requesting another code).
    if (otpValidateResult.isError) {
      // Errors from OTP service are returned in a format that our middleware doesn't handle;
      // we'll try our best to use the formatted error from our middleware but if not just
      // use the values extracted from the raw error.
      let maybeAlternativeFormatError: Otp.OtpError | null;
      try {
        maybeAlternativeFormatError = (otpValidateResult.errorRaw as { data: Otp.OtpError }).data;
      } catch (error) {
        maybeAlternativeFormatError = null;
      }
      const error = otpValidateResult.error || maybeAlternativeFormatError;
      const errorReason = mapReauthenticationOtpErrorToResource(resources, error);
      setRequestError(`${errorReason} ${resources.Action.PleaseTryAgain}`);

      eventService.sendCodeVerificationFailedEvent(ReauthenticationType.OtpEmail, errorReason);
      // If the code is just expired we should invalidate the challenge and have the user
      // restart the flow.
      if (error === Otp.OtpError.CODE_EXPIRED || error === Otp.OtpError.INVALID_SESSION_TOKEN) {
        dispatch({
          type: ReauthenticationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapOtpErrorToChallengeErrorCode(error)
        });
      }
      setRequestInFlight(false);
      return;
    }

    eventService.sendCodeVerifiedEvent(ReauthenticationType.OtpEmail);
    // Then trigger reauthentication with the now valid (hopefully) session.
    const result = await requestService.reauthentication.generateToken({
      sessionId: otpSessionId,
      type: ReauthenticationType.OtpEmail
    });

    // Same as above.
    if (result.isError) {
      setRequestError(
        `${mapReauthenticationErrorToResource(resources, result.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    metricsService.fireVerifiedEvent(ReauthenticationType.OtpEmail);
    setRequestError(null);
    dispatch({
      type: ReauthenticationActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        reauthenticationToken: result.value.token
      }
    });
  }, [
    dispatch,
    otpCode,
    otpSessionId,
    requestService.otp,
    requestService.reauthentication,
    metricsService,
    eventService,
    resources,
    setRequestError,
    setRequestInFlight
  ]);

  const registerCountdown = () => {
    // Captured in the closure below (Date.now() does not recompute in the interval).
    const thirtySecondsLater = Date.now() + CODE_SEND_INTERVAL_SECONDS * MILLIS;
    setOtpResendCodeRemainingTime(CODE_SEND_INTERVAL_SECONDS);
    const intervalId = setInterval(() => {
      const differenceInSeconds = Math.round((thirtySecondsLater - Date.now()) / MILLIS);
      const next = Math.max(0, differenceInSeconds);
      if (next <= 0) {
        clearInterval(intervalId);
      }
      setOtpResendCodeRemainingTime(next);
    }, 1000);
    setOtpResendCodeIntervalId(intervalId);
  };

  const resendOtpCode = async () => {
    setRequestInFlight(true);

    if (otpSessionId === null) {
      // TODO (ACCSEC-1181): emit a metric to alert on
      setRequestError(
        `${mapReauthenticationErrorToResource(resources, ReauthenticationError.UNKNOWN)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    const result = await requestService.otp.resendCode(Otp.ContactTypes.Email, otpSessionId);
    if (result.isError) {
      setRequestError(
        `${mapReauthenticationOtpErrorToResource(resources, Otp.OtpError.UNKNOWN)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    eventService.sendOtpResendRequestedEvent();

    registerCountdown();
    setRequestError(null);
    setOtpSessionId(result.value.otpSessionToken);
    setRequestInFlight(false);
  };

  /*
   * Component-level Effects
   */

  // Send the initial OTP code.
  useEffect(() => {
    const sendCodeWrapper = async () => {
      // Skip sending another code if we've sent one already.
      if (initialOtpSessionId !== null) return;
      const result = await requestService.otp.sendCodeForUser(Otp.ContactTypes.Email);
      if (result.isError) {
        // In the event the OTP service returns an error response a request error is set that
        // results in the user being prompted to try an alternative method.
        setRequestError(
          `${mapReauthenticationErrorToResource(resources, ReauthenticationError.UNKNOWN)} ${
            resources.Action.TryAlternativeMethod
          }`
        );
        return;
      }

      setOtpSessionId(result.value.otpSessionToken);
      registerCountdown();

      // Don't send more codes on re-renders.
      dispatch({
        type: ReauthenticationActionType.INITIALIZE_EMAIL_OTP_SESSION,
        sessionId: result.value.otpSessionToken
      });
    };

    // eslint-disable-next-line no-void
    void sendCodeWrapper();

    return () => {
      if (otpResendCodeIntervalId === null) return;
      clearInterval(otpResendCodeIntervalId);
      setOtpResendCodeIntervalId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const verifyCodeWrapper = async () => {
      await verifyOtpCode();
    };

    if (otpCode.length === otpCodeLength) {
      // eslint-disable-next-line no-void
      void verifyCodeWrapper();
    }
  }, [otpCode, otpCodeLength, verifyOtpCode]);

  /*
   * Render Properties
   */

  const resendButtonTextHelper = (): string => {
    const happyPathButtonText =
      otpResendCodeRemainingTime > 0
        ? `${resources.Action.CodeSent} (${otpResendCodeRemainingTime})`
        : `${resources.Action.ResendCode}`;

    return requestError ? resources.Message.Error.Default : happyPathButtonText;
  };

  const resendOtpCodeButtonConfig: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resendButtonTextHelper()
    ),
    label: resources.Action.ResendCode,
    enabled: !requestInFlight && otpResendCodeRemainingTime <= 0,
    action: resendOtpCode
  };

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomXLargeClassName = renderInline
    ? 'inline-challenge-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';

  return (
    <React.Fragment>
      <BodyElement>
        <div className={lockIconClassName} />
        <p className={marginBottomXLargeClassName}>
          {requestError || resources.Description.EnterYourOtpCode}
        </p>

        <InputControl
          id='reauthentication-email-otp-input'
          inputType='password'
          disabled={requestInFlight}
          value={otpCode}
          setValue={setOtpCode}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          canSubmit={otpCode.length === otpCodeLength}
          handleSubmit={verifyOtpCode}
          onChange={clearRequestError}
          // Optional parameters:
          autoComplete='off'
          placeholder={resources.Label.YourOtpCode}
          hideFeedback
        />
        <p>{children}</p>
      </BodyElement>
      <FooterElement positiveButton={resendOtpCodeButtonConfig} negativeButton={null} />
    </React.Fragment>
  );
};

export default OtpInput;
