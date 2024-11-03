/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { Fragment, useEffect } from 'react';
import { Modal } from 'react-style-guide';
import { useDebounce, withTranslations, WithTranslationsProps } from 'react-utilities';

import useEmailVerifyCodeModalContext from '../hooks/useEmailVerifyCodeModalContext';
import { emailVerifyCodeModalActionType } from '../store/emailVerifyCodeModalStoreContext';

import EnterEmailPage from '../components/EnterEmailPage';
import EnterCodePage from '../components/EnterCodePage';

import { sendCode, resendCode, validateCode } from '../services/otpService';
import {
  pageNames,
  contactType,
  errorCodes,
  errorStrings,
  statusCodes,
  experimentLayer
} from '../constants/EmailVerifyCodeModalConstants';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

import useExperiments from '../../common/hooks/useExperiments';

import { loginTranslationConfig } from '../translation.config';
import { TEnterCodeErrorEvent } from '../../common/types/otpTypes';
import {
  sendErrorEvent,
  sendOtpButtonClickEvent,
  sendOtpModalActionEvent
} from '../services/eventService';
import { EmailVerifyCodeModalParams } from '../interface';

export const EmailVerifyCodeModalContainer = ({
  containerId,
  codeLength,
  onEmailCodeEntered,
  onComplete,
  onModalAbandoned,
  enterEmailTitle,
  enterEmailDescription,
  enterCodeTitle,
  enterCodeDescription,
  legalCheckboxLabel,
  origin,
  translate,
  isChangeEmailEnabled = false,
  renderInWebview
}: EmailVerifyCodeModalParams): JSX.Element => {
  const {
    state: {
      emailVerifyCodeModalPage,
      email,
      sessionToken,
      code,
      isChecked,
      isCheckboxEnabled,
      isLoading,
      isCodeValid,
      errorMessage,
      isModalOpen,
      isContinueButtonEnabled
    },
    dispatch
  } = useEmailVerifyCodeModalContext();

  const debouncedCode = useDebounce(code, 200);

  // handle email code enter without validation on entries like login with OTP.
  useEffect(() => {
    if (onEmailCodeEntered && !legalCheckboxLabel && debouncedCode.length === codeLength) {
      // eslint-disable-next-line no-void
      void handleValidateCode();
      dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: true });
      sendOtpButtonClickEvent(EVENT_CONSTANTS.context.enterOTP, EVENT_CONSTANTS.btn.login, origin);
    } else if (legalCheckboxLabel) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_CHECKBOX_AND_CONTINUE_BUTTON_STATE,
        isContinueButtonEnabled: debouncedCode.length === codeLength && isChecked,
        isCheckboxEnabled: debouncedCode.length === codeLength
      });
    }
  }, [debouncedCode, isChecked]);

  useEffect(() => {
    if (legalCheckboxLabel && onComplete && isCodeValid) {
      // handle OTP signup case
      dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });
      sendOtpModalActionEvent(
        EVENT_CONSTANTS.context.enterOTP,
        EVENT_CONSTANTS.aType.dismissed,
        origin
      );
      sendOtpButtonClickEvent(EVENT_CONSTANTS.context.enterOTP, EVENT_CONSTANTS.btn.signup, origin);
      onComplete({ otpSessionToken: sessionToken, otpContactType: contactType });
    } else if (isCodeValid && onEmailCodeEntered) {
      dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });

      // handle OTP login case
      onEmailCodeEntered(sessionToken, debouncedCode);
    }
  }, [isCodeValid]);

  // attach event listener for onEnterEmailVerifyCodeError to handle errors from
  // submitting the code
  useEffect(() => {
    const onEnterEmailVerifyCodeError = (event: CustomEvent<TEnterCodeErrorEvent>) => {
      if (event.detail) {
        if (event.detail.shouldCloseModal) {
          handleCloseModal();
          return;
        }
        dispatch({
          type: emailVerifyCodeModalActionType.SET_ERROR,
          errorMessage: event.detail.errorMessage
        });
      }
      dispatch({ type: emailVerifyCodeModalActionType.SET_OTP_CODE, code: '' });
      dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: false });
    };

    window.addEventListener(
      'onEnterEmailVerifyCodeError',
      onEnterEmailVerifyCodeError as EventListener
    );
    return () => {
      window.removeEventListener(
        'onEnterEmailVerifyCodeError',
        onEnterEmailVerifyCodeError as EventListener
      );
    };
  }, []);

  // allow this modal to be closed from elsewhere, such as the accountSelector
  // TODO: user createModal function to create modal, so that close method in
  // IModalService can be accessed
  useEffect(() => {
    window.addEventListener('closeEmailVerifyCodeModal', handleCloseModal);
  }, []);

  const handleCloseModal = () => {
    onModalAbandoned();
    dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });
  };

  const handleError = (error: unknown, ctx: string) => {
    const errorObject = error as Record<string, unknown>;
    const errorCode = errorObject.data;
    const statusCode = errorObject.status;

    dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: false });
    if (errorCode === errorCodes.throttled) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.Throttled)
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    if (errorCode === errorCodes.vpnRequired) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.VpnRequired)
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    // invalid code error
    if (errorCode === errorCodes.codeInvalid) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.CodeInvalid)
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    // gateWay throttle has no error code, but same statusCode as ip throttle
    if (statusCode === statusCodes.gatewayThrottle) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.Throttled)
      });
      sendErrorEvent(ctx, String(statusCode), origin);
      return;
    }
    if (errorCode === errorCodes.sessionTokenInvalid) {
      // this will only be reached from resend endpoint
      // send new code if session token for previous code expired
      sendErrorEvent(ctx, String(errorCode), origin);
      // eslint-disable-next-line no-void
      void handleSendCode();
      return;
    }
    sendErrorEvent(ctx, String(errorCode), origin);
    dispatch({
      type: emailVerifyCodeModalActionType.SET_ERROR,
      errorMessage: translate(errorStrings.Unknown)
    });
  };

  const handleSendCode = async () => {
    try {
      const data = await sendCode({ origin, contactType, contactValue: email });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_SESSION_TOKEN,
        sessionToken: data?.otpSessionToken ?? ''
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: ''
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ENTER_CODE_PAGE
      });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.sendOTP);
    }
  };

  const handleResendCode = async () => {
    try {
      const data = await resendCode({ contactType, origin, otpSessionToken: sessionToken });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_SESSION_TOKEN,
        sessionToken: data?.otpSessionToken ?? ''
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: ''
      });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.enterOTP);
    }
  };

  const handleValidateCode = async () => {
    try {
      const data = await validateCode({
        passCode: debouncedCode,
        otpSessionToken: sessionToken,
        contactType,
        origin
      });
      dispatch({ type: emailVerifyCodeModalActionType.SET_CODE_VALID, isCodeValid: true });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.validateOTP);
    }
  };

  const handleContinue = () => {
    if (isContinueButtonEnabled) {
      sendOtpButtonClickEvent(
        EVENT_CONSTANTS.context.enterOTP,
        EVENT_CONSTANTS.btn.continue,
        origin
      );
      // eslint-disable-next-line no-void
      void handleValidateCode();
    }
  };

  return (
    <Modal
      className={renderInWebview ? 'email-verify-code-webview' : 'email-verify-code-modal'}
      show={isModalOpen}
      size='lg'
      backdrop='static'
      onHide={handleCloseModal}>
      <Fragment>
        {emailVerifyCodeModalPage === pageNames.EnterEmail && (
          <EnterEmailPage
            origin={origin}
            titleText={enterEmailTitle}
            descriptionText={enterEmailDescription}
            onSendCode={handleSendCode}
            errorMessage={errorMessage}
            onClose={handleCloseModal}
            translate={translate}
          />
        )}
        {emailVerifyCodeModalPage === pageNames.EnterCode && sessionToken && (
          <EnterCodePage
            origin={origin}
            titleText={enterCodeTitle}
            descriptionText={enterCodeDescription}
            legalCheckboxLabel={legalCheckboxLabel}
            code={code}
            codeLength={codeLength}
            onContinueButtonPressed={handleContinue}
            onResendCode={handleResendCode}
            isLoading={isLoading}
            isContinueButtonEnabled={isContinueButtonEnabled}
            isCheckboxEnabled={isCheckboxEnabled}
            isChecked={isChecked}
            errorMessage={errorMessage}
            onClose={handleCloseModal}
            translate={translate}
            isChangeEmailEnabled={isChangeEmailEnabled}
          />
        )}
      </Fragment>
    </Modal>
  );
};

export default withTranslations(EmailVerifyCodeModalContainer, loginTranslationConfig);
