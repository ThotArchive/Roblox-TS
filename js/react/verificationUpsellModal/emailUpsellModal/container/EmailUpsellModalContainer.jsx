import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useEmailUpsellState from '../hooks/useEmailUpsellState';
import EmailUpsellModal from '../components/EmailUpsellModal';

import {
  sendEmailVerification,
  updateEmailAddress,
  validateEmailAddress
} from '../services/emailServices';
import redactEmailAddress from '../utils/emailUtils';
import { getSectionValueForPage } from '../utils/loggingUtils';
import emailSubmissionErrorConstants from '../constants/emailSubmissionErrorConstants';

import {
  SET_MODAL_STATES,
  SET_USER_EMAIL_STATES,
  SET_PAGENAME_STATE,
  SET_INPUT_STATE,
  SET_ERROR_STATE,
  SET_EMAIL_SENT_STATE,
  SET_RESEND_EMAIL_STATE,
  SET_EMAIL_ADDED_STATE,
  SET_EMAIL_UPDATING_STATE,
  SET_TRIGGER_ORIGIN,
  SET_INPUT_CLEAR
} from '../actions/actionTypes';
import { getErrorMessageFromEmailSubmissionErrorCode } from '../utils/errorUtils';
import {
  getErrorEventWithErrorCodeParam,
  sendVerificationUpsellEvent
} from '../../common/utils/loggingUtils';
import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import events from '../constants/verificationUpsellEventStreamConstants';

const { MessageConfirmationEmailNotSent, MessageInvalidEmailAddress } = verificationUpsellConstants;
const { InvalidEmailCode } = emailSubmissionErrorConstants;

function EmailUpsellModalContainer({ translate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { emailUpsellState, dispatch } = useEmailUpsellState();

  useEffect(() => {
    if (!emailUpsellState.pageName) {
      return; // don't log when no page is set yet
    }
    sendVerificationUpsellEvent(events.showModal, {
      origin: emailUpsellState.origin,
      section: getSectionValueForPage(emailUpsellState.pageName)
    });
  }, [emailUpsellState.pageName]);

  useEffect(() => {
    window.addEventListener(
      'OpenVerificationModal',
      event => {
        setModalOpen(true);
        dispatch({
          type: SET_TRIGGER_ORIGIN,
          origin: event.detail.origin,
          skipCallback: event.detail.skipCallback,
          closeCallback: event.detail.closeCallback
        });
        dispatch({
          type: SET_USER_EMAIL_STATES,
          isEmailVerified: event.detail.isEmailVerified,
          userEmail: event.detail.email
        });
        const pageName =
          event.detail.requireVerification && event.detail.email
            ? verificationUpsellConstants.Verification
            : verificationUpsellConstants.UpdateEmail;
        dispatch({ type: SET_PAGENAME_STATE, pageName });
        dispatch({
          type: SET_MODAL_STATES,
          experimentParameters: event.detail?.experimentParameters
        });
      },
      false
    );
  }, []);

  function handlePrimaryAction() {
    const section = getSectionValueForPage(emailUpsellState.pageName);
    switch (emailUpsellState.pageName) {
      case verificationUpsellConstants.Verification:
        sendVerificationUpsellEvent(events.clickResendConfirmationEmail, {
          origin: emailUpsellState.origin,
          section
        });
        sendEmailVerification().then(rst => {
          if (rst !== true) {
            // rst will be an error code int if failed
            dispatch({ type: SET_ERROR_STATE, errorMsg: MessageConfirmationEmailNotSent });
            const errorEvent = getErrorEventWithErrorCodeParam(events.showError, rst);
            sendVerificationUpsellEvent(errorEvent, {
              origin: emailUpsellState.origin,
              section
            });
          } else {
            dispatch({ type: SET_EMAIL_SENT_STATE });
            setTimeout(() => {
              dispatch({ type: SET_RESEND_EMAIL_STATE });
            }, 15000);
          }
        });
        break;
      case verificationUpsellConstants.UpdateEmail:
        sendVerificationUpsellEvent(events.clickContinue, {
          origin: emailUpsellState.origin,
          section
        });
        if (validateEmailAddress(emailUpsellState.userEmailInput)) {
          sendVerificationUpsellEvent(events.clickSendConfirmationEmail, {
            origin: emailUpsellState.origin,
            section
          });
          dispatch({ type: SET_EMAIL_UPDATING_STATE, isEmailUpdating: true });
          updateEmailAddress({
            emailAddress: emailUpsellState.userEmailInput
          }).then(rst => {
            if (rst !== true) {
              // rst is either `true` or a numeric error code
              const errorMessage = getErrorMessageFromEmailSubmissionErrorCode(rst);
              const errorEvent = getErrorEventWithErrorCodeParam(events.showError, rst);
              sendVerificationUpsellEvent(errorEvent, {
                origin: emailUpsellState.origin,
                section
              });
              dispatch({ type: SET_ERROR_STATE, errorMsg: errorMessage });
              dispatch({ type: SET_EMAIL_UPDATING_STATE, isEmailUpdating: false });
            } else {
              dispatch({
                type: SET_USER_EMAIL_STATES,
                isEmailVerified: false,
                userEmail: redactEmailAddress(emailUpsellState.userEmailInput)
              });
              dispatch({ type: SET_INPUT_CLEAR });
              dispatch({
                type: SET_PAGENAME_STATE,
                pageName: verificationUpsellConstants.Verification
              });
              dispatch({ type: SET_MODAL_STATES });
              dispatch({ type: SET_EMAIL_UPDATING_STATE, isEmailUpdating: false });
              dispatch({ type: SET_EMAIL_ADDED_STATE });
            }
          });
          dispatch({ type: SET_MODAL_STATES });
        } else {
          // there was no network request, but this is detected as an invalid
          // email without needing to make a request, hence the InvalidEmailCode log
          const errorEvent = getErrorEventWithErrorCodeParam(events.showError, InvalidEmailCode);
          sendVerificationUpsellEvent(errorEvent, {
            origin: emailUpsellState.origin,
            section
          });
          dispatch({ type: SET_ERROR_STATE, errorMsg: MessageInvalidEmailAddress });
        }
        break;
      default:
    }
  }

  function handleSecondaryAction() {
    const section = getSectionValueForPage(emailUpsellState.pageName);
    switch (emailUpsellState.pageName) {
      case verificationUpsellConstants.Verification:
        sendVerificationUpsellEvent(events.clickChangeEmail, {
          origin: emailUpsellState.origin,
          section
        });
        dispatch({ type: SET_PAGENAME_STATE, pageName: verificationUpsellConstants.UpdateEmail });
        dispatch({ type: SET_MODAL_STATES });
        break;
      case verificationUpsellConstants.UpdateEmail:
        if (emailUpsellState.skipCallback) {
          sendVerificationUpsellEvent(
            emailUpsellState.origin === verificationUpsellConstants.Logout
              ? events.skipLogoutAnyway
              : events.skipPrepurchaseVerification,
            {
              origin: emailUpsellState.origin,
              section
            }
          );
          emailUpsellState.skipCallback();
        }
        dispatch({ type: SET_INPUT_CLEAR });
        setModalOpen(false);
        break;
      default:
    }
  }

  function handleInputFocus() {
    sendVerificationUpsellEvent(events.touchEmail, {
      origin: emailUpsellState.origin,
      section: getSectionValueForPage(emailUpsellState.pageName)
    });
  }

  function handleInputChange(value) {
    dispatch({
      type: SET_INPUT_STATE,
      pageName: verificationUpsellConstants.UpdateEmail,
      value
    });
  }
  function handleKeyDown(value) {
    if (value === verificationUpsellConstants.Enter) {
      return handlePrimaryAction();
    }
    return false;
  }

  function handleBackAction() {
    dispatch({ type: SET_PAGENAME_STATE, pageName: verificationUpsellConstants.UpdateEmail });
    dispatch({ type: SET_MODAL_STATES });
  }

  function handleEmailModalDismiss() {
    sendVerificationUpsellEvent(events.dismissModal, {
      origin: emailUpsellState.origin,
      section: getSectionValueForPage(emailUpsellState.pageName)
    });
    dispatch({ type: SET_INPUT_CLEAR });
    if (emailUpsellState.closeCallback) {
      emailUpsellState.closeCallback(emailUpsellState.isEmailAdded);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <EmailUpsellModal
        show={isModalOpen}
        onHide={() => handleEmailModalDismiss()}
        onPrimaryAction={() => handlePrimaryAction()}
        onSecondaryAction={() => handleSecondaryAction()}
        onInputFocus={() => handleInputFocus()}
        onInputChange={value => handleInputChange(value)}
        onKeyDown={value => handleKeyDown(value)}
        onBackAction={() => handleBackAction()}
        translate={translate}
      />
    </div>
  );
}

EmailUpsellModalContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default EmailUpsellModalContainer;
