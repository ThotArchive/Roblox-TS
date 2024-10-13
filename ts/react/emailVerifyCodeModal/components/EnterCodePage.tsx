import React, { Fragment, useEffect, useState, ChangeEvent } from 'react';
import { Button, Modal, Loading } from 'react-style-guide';
import { useDebounce, withTranslations, WithTranslationsProps } from 'react-utilities';
import { emailVerifyCodeModalActionType } from '../store/emailVerifyCodeModalStoreContext';
import { enterCodeStrings, helpUrl } from '../constants/EmailVerifyCodeModalConstants';
import { oneTimePassTranslationConfig } from '../translation.config';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import {
  sendOtpModalActionEvent,
  sendOtpButtonClickEvent,
  sendOtpAuthPageLoadEvent,
  sendCodeInputEvent,
  sendOtpCheckboxEvent
} from '../services/eventService';
import LegalCheckbox from '../../common/components/LegalCheckbox';
import useEmailVerifyCodeModalContext from '../hooks/useEmailVerifyCodeModalContext';

export type enterCodePageProps = {
  origin: string;
  titleText: string;
  descriptionText: string;
  legalCheckboxLabel?: string;
  code: string;
  codeLength: number;
  isCheckboxEnabled: boolean;
  isChecked: boolean;
  isLoading: boolean;
  isContinueButtonEnabled: boolean;
  errorMessage: string;
  onResendCode: () => void;
  onContinueButtonPressed: () => void;
  onClose: () => void;
  translate: WithTranslationsProps['translate'];
  isChangeEmailEnabled: boolean;
};

const EnterCodePage = ({
  origin,
  titleText,
  descriptionText,
  legalCheckboxLabel,
  code,
  codeLength,
  isCheckboxEnabled,
  isContinueButtonEnabled,
  onContinueButtonPressed,
  onResendCode,
  onClose,
  translate,
  isChangeEmailEnabled
}: enterCodePageProps): JSX.Element => {
  const {
    state: { email, isChecked, isLoading, errorMessage },
    dispatch
  } = useEmailVerifyCodeModalContext();
  const [isResendEnabled, setIsResendEnabled] = useState(true);
  const [timeUntilResend, setTimeUntilResend] = useState(0);
  const [isFirstCodeChange, setIsFirstCodeChange] = useState(true);

  const debouncedCode = useDebounce(code, 200);

  const context = EVENT_CONSTANTS.context.enterOTP;

  const startCountdownTimer = () => {
    setIsResendEnabled(false);
    if (timeUntilResend === 0) {
      const id = setInterval(() => {
        setTimeUntilResend(time => {
          if (time === 1) {
            clearInterval(id);
            setIsResendEnabled(true);
          }
          return time - 1;
        });
      }, 1000);
    }
    setTimeUntilResend(30);
  };

  const handleResendCode = () => {
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.resendCode, origin);
    onResendCode();
    startCountdownTimer();
  };

  const handleCodeChange = (newCode: string) => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_ERROR, errorMessage: '' });
    const cleanedCode = newCode.replace(/\D/g, '');
    // do not need to slice as input has maxLength of codeLength already
    dispatch({ type: emailVerifyCodeModalActionType.SET_OTP_CODE, code: cleanedCode });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_LEGAL_CHECK, isChecked: e.target.checked });
    sendOtpCheckboxEvent(
      context,
      EVENT_CONSTANTS.btn.parentalConsentCheckbox,
      e.target.checked,
      origin
    );
  };

  useEffect(() => {
    if (isFirstCodeChange && code.length > 0) {
      setIsFirstCodeChange(false);
      sendCodeInputEvent(origin);
    }
  }, [debouncedCode]);

  const handleClose = (): void => {
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.cancel, origin);
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.dismissed, origin);
    onClose();
  };

  const ResendButtonComponent = () => {
    if (isLoading) {
      return <Loading />;
    }
    return (
      <Button
        className='email-verify-code-button'
        variant={Button.variants.secondary}
        onClick={handleResendCode}
        isDisabled={!isResendEnabled}>
        {isResendEnabled
          ? translate(enterCodeStrings.Resend)
          : `${translate(enterCodeStrings.CodeSent)} (${timeUntilResend})`}
      </Button>
    );
  };
  const ContinueButtonComponent = () => {
    if (legalCheckboxLabel) {
      return (
        <Button
          className='email-verify-code-button'
          variant={Button.variants.primary}
          onClick={onContinueButtonPressed}
          isDisabled={!isContinueButtonEnabled}>
          {translate(enterCodeStrings.Continue)}
        </Button>
      );
    }
    return null;
  };

  const LearnMoreComponent = () => {
    if (!legalCheckboxLabel) {
      return (
        <div className='font-caption-header email-verify-code-help-link'>
          <a className='text-link' href={helpUrl} target='_blank' rel='noreferrer'>
            {translate(enterCodeStrings.DidNotReceive)}
          </a>
        </div>
      );
    }
    return null;
  };

  const LegalCheckboxComponent = () => {
    if (legalCheckboxLabel) {
      return (
        <div className='legal-checkbox-container'>
          <LegalCheckbox
            id='parent-consent'
            legalText={legalCheckboxLabel}
            isChecked={isChecked}
            disabled={!isCheckboxEnabled}
            onCheckBoxChanged={handleCheckboxChange}
          />
        </div>
      );
    }
    return null;
  };

  const emailHelpTextWithEmailListed = (
    <div
      className='email-verify-code-help-text'
      dangerouslySetInnerHTML={{
        __html: `<p className='email-verify-code-help-text'>${translate(
          enterCodeStrings.EnterCodeHelp,
          {
            email: `<b>${email}</b>`
          }
        )}</p>`
      }}
    />
  );

  const handleChangeEmail = () => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_ENTER_EMAIL_PAGE });
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.changeEmail, origin);
  };

  useEffect(() => {
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.shown, origin);
    sendOtpAuthPageLoadEvent(context, origin);
    startCountdownTimer();
  }, []);

  return (
    <Fragment>
      <Modal.Header title={titleText} onClose={handleClose} />
      <Modal.Body>
        {isChangeEmailEnabled ? (
          <Fragment>
            {emailHelpTextWithEmailListed}
            <div className='email-verify-code-email-display'>
              <button
                className='email-verify-code-change-email-link text-link'
                type='button'
                onClick={handleChangeEmail}>
                {translate(enterCodeStrings.ChangeEmail)}
              </button>
            </div>
          </Fragment>
        ) : (
          <p className='email-verify-code-help-text'>{descriptionText}</p>
        )}
        <input
          placeholder={translate(enterCodeStrings.CodePlaceholder)}
          onChange={e => handleCodeChange(e.target.value)}
          type='text'
          inputMode='numeric'
          maxLength={codeLength}
          /* eslint-disable */
          autoFocus
          /* eslint-enable */
          className='form-control input-field email-verify-code-input'
          value={code}
          disabled={isLoading}
        />
        <p className='text-error email-verify-code-error-text'>{errorMessage}</p>
        <LegalCheckboxComponent />
        <ContinueButtonComponent />
        <ResendButtonComponent />
        <LearnMoreComponent />
      </Modal.Body>
    </Fragment>
  );
};

export default withTranslations(EnterCodePage, oneTimePassTranslationConfig);
