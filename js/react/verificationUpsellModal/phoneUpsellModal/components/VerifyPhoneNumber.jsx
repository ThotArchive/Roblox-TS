/* eslint-disable no-nested-ternary */
// This is a boiler plate for now.
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import { phoneUpsellStrings } from '../../common/constants/translationConstants';
import {
  getErrorEventWithErrorCodeParam,
  sendVerificationUpsellEvent
} from '../../common/utils/loggingUtils';
import getErrorCodeFromRequestError from '../../common/utils/requestUtils';
import { SET_ERROR_MESSAGE, SET_PAGE, SET_PHONE_VERIFICATION_STATUS } from '../actions/actionTypes';
import { ADD_PHONE_NUMBER_PAGE } from '../constants/pageConstants';
import { phoneNumberA11yInputLabels, phoneSubmissionConstants } from '../constants/phoneConstants';
import events from '../constants/phoneVerificationEventStreamConstants';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import { resendCode, verifyWithCode } from '../services/phoneService';
import { getErrorMessageFromVerificationErrorCode } from '../utils/errorUtils';
import getSectionValueForPage from '../utils/loggingUtils';
import getCleanInputCode from '../utils/verificationCodeUtils';
import InputFieldError from './InputFieldError';
import getSettingsUIPolicy from '../services/universalAppConfigurationService';

function VerifyPhoneNumber({ translate, onHide, onVerify }) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const {
    phone,
    phonePrefixOptionsList,
    phonePrefixPickerIndex,
    pageName,
    origin
  } = phoneUpsellState;
  const [verificationCodeState, setVerificationCodeState] = useState({
    code: '',
    isReadyToSubmitCode: ''
  });
  const section = getSectionValueForPage(pageName);
  const [timer, setTimer] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const {
    HeadingVerifyYourPhone,
    ActionChangePhoneNumber,
    ActionContinue,
    ActionResendCode,
    ActionCodeResent,
    LabelEnterCode,
    LabelVerificationCode
  } = phoneUpsellStrings;

  const { VerificationCodeInputId } = phoneNumberA11yInputLabels;

  const {
    Enter,
    CodeLength,
    CountdownFormatStart,
    CountdownFormatEnd,
    ResendCountdownDuration,
    phoneNumberToShowStr
  } = phoneSubmissionConstants;

  const { prefix } = phonePrefixOptionsList[phonePrefixPickerIndex];
  const phoneNumberToShow = phoneNumberToShowStr(prefix, phone);

  async function submitCode() {
    // although we can submit via many methods (press enter, paste, click
    // continue), we will log them all as presses to "Continue"
    sendVerificationUpsellEvent(events.verifyPhoneContinuePressed, {
      origin,
      section
    });

    if (verificationCodeState.code.length !== CodeLength) {
      // don't verify unless code is the right length
      return;
    }
    setIsSendingCode(true);
    dispatch({
      type: SET_ERROR_MESSAGE,
      errorMessage: ''
    });
    try {
      await verifyWithCode(verificationCodeState.code);
      dispatch({ type: SET_PHONE_VERIFICATION_STATUS, isPhoneVerified: true });
      await onVerify();
    } catch (err) {
      const errorCode = getErrorCodeFromRequestError(err);
      const errorStringResource = getErrorMessageFromVerificationErrorCode(errorCode);
      const errorEvent = getErrorEventWithErrorCodeParam(
        events.phoneNumberModalErrorShown,
        errorCode
      );
      sendVerificationUpsellEvent(errorEvent, {
        origin,
        section
      });
      dispatch({
        type: SET_ERROR_MESSAGE,
        errorMessage: errorStringResource
      });
    } finally {
      setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: false });
      setIsSendingCode(false);
    }
  }

  useEffect(() => {
    if (verificationCodeState.isReadyToSubmitCode) {
      submitCode();
    }
  }, [verificationCodeState]);

  useEffect(() => {
    async function showOrHideResendButton() {
      const policy = await getSettingsUIPolicy();
      if (policy.displayPhoneVerificationResendButton) {
        setShowResendButton(true);
      } else {
        setShowResendButton(false);
      }
    }
    showOrHideResendButton();
  }, []);

  function handleChangeNumberClick() {
    sendVerificationUpsellEvent(events.verifyPhoneChangePhoneNumberPressed, {
      origin,
      section
    });
    dispatch({ type: SET_PAGE, pageName: ADD_PHONE_NUMBER_PAGE });
  }

  function handleCodeChange(input) {
    dispatch({
      type: SET_ERROR_MESSAGE,
      errorMessage: ''
    });
    setVerificationCodeState({ ...verificationCodeState, code: getCleanInputCode(input) });
  }

  function handleVerificationCodeFocused() {
    sendVerificationUpsellEvent(events.verifyPhoneCodeFieldPressed, {
      origin,
      section
    });
  }

  function startCountdownTimer() {
    if (timer === 0) {
      const id = setInterval(() => {
        setTimer(time => {
          if (time === 1) {
            clearInterval(id);
          }
          return time - 1;
        });
      }, 1000);
    }
    setTimer(ResendCountdownDuration);
  }

  function handleResendCode() {
    sendVerificationUpsellEvent(events.verifyPhoneResendPressed, {
      origin,
      section
    });
    if (timer === 0) {
      resendCode();
      startCountdownTimer();
    }
  }

  function handleKeyDown(value) {
    if (value === Enter) {
      // interpret pressing Enter as a click to continue
      setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: true });
    }
  }

  function handlePaste(event) {
    const pastedValue = (event.clipboardData || window.clipboardData).getData('text');
    const cleanedPasteCode = getCleanInputCode(pastedValue);
    setVerificationCodeState({ code: cleanedPasteCode, isReadyToSubmitCode: true });
  }

  function handleContinueClick() {
    setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: true });
  }

  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='verification-upsell-title-container'>
          <button type='button' className='verification-upsell-title-button' onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate(HeadingVerifyYourPhone)}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='phone-number-verification-upsell-image' />
        <div className='verification-upsell-text-body text-description'>
          {translate(LabelEnterCode, { phoneNumber: phoneNumberToShow })}
        </div>
        <button
          type='button'
          className='phone-number-change-number-button phone-number-text-button'
          onClick={handleChangeNumberClick}>
          {translate(ActionChangePhoneNumber)}
        </button>
        <label htmlFor={VerificationCodeInputId}>
          <p className='verification-code-label font-caption-header text-primary'>
            {translate(LabelVerificationCode)}
          </p>
        </label>
        <input
          id={VerificationCodeInputId}
          type='text' // using text type + filtering for non-numeric chars because "e-+" are special chars in a numeric input
          inputMode='numeric' // use numeric inputMode instead of type=number because number will clip leading zeros in submission
          className={`${
            phoneUpsellState.errorMessage ? 'input-field-error' : ''
          } form-control input-field input-number verification-code-input`}
          onChange={event => handleCodeChange(event.target.value)}
          onPaste={handlePaste}
          autoComplete='one-time-code'
          placeholder='000000'
          onKeyDown={event => handleKeyDown(event.key)}
          onFocus={handleVerificationCodeFocused}
          value={verificationCodeState.code}
        />
        <InputFieldError translate={translate} />
      </Modal.Body>
      <Modal.Footer>
        <button
          type='button'
          className='btn-cta-md btn-max-width phone-number-verify-button'
          disabled={isSendingCode || verificationCodeState.code.length !== 6}
          onClick={handleContinueClick}>
          {translate(ActionContinue)}
        </button>
        {showResendButton ? (
          timer === 0 ? (
            <button
              type='button'
              className=' btn-secondary-md btn-max-width phone-number-resent-button'
              disabled={isSendingCode}
              onClick={handleResendCode}>
              {translate(ActionResendCode)}
            </button>
          ) : (
            <button
              type='button'
              className=' btn-secondary-md btn-max-width phone-number-resent-button btn-max-width resend-button-disabled'>
              {translate(ActionCodeResent)}
              <span>{CountdownFormatStart + timer + CountdownFormatEnd}</span>
            </button>
          )
        ) : null}
      </Modal.Footer>
    </div>
  );
}

VerifyPhoneNumber.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired
};

export default VerifyPhoneNumber;
