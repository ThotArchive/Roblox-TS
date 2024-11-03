import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CurrentUser } from 'Roblox';
import getInvalidPasswordMessage from '../../../core/utils/passwordValidatorGeneric';
import FacebookSunsetModal from '../components/FacebookSunsetModal';
import {
  disconnectFacebook,
  setPassword,
  sendFacebookSunsetEvent
} from '../services/facebookSunsetService';
import events from '../constants/eventConstants';
import {
  oldPasswordPlaceholder,
  passwordErrorMessages
} from '../constants/facebookSunsetConstants';

function FacebookSunsetContainer({ translate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [hasUserAddedPassword, setHasUserAddedPassword] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState('');
  const [confirmPasswordFieldError, setConfirmPasswordFieldError] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [postModalActions, setPostModalActionsFunction] = useState({});

  useEffect(() => {
    window.addEventListener(
      'OpenFacebookSunsetModal',
      event => {
        setPostModalActionsFunction({
          closeCallback: event.detail.closeCallback
        });
        setModalOpen(true);
      },
      false
    );
  }, []);

  useEffect(() => {
    if (passwordInput || confirmPasswordInput) {
      handlePasswordValidationErrors();
    }
  }, [passwordInput, confirmPasswordInput]);

  function handlePasswordValidationErrors() {
    const errorMessage = getInvalidPasswordMessage(passwordInput, CurrentUser.name);
    if (errorMessage) {
      setPasswordFieldError(errorMessage);
    } else if (passwordInput !== confirmPasswordInput) {
      setPasswordFieldError('');
      setConfirmPasswordFieldError(passwordErrorMessages.DoNotMatch);
    } else if (passwordFieldError || confirmPasswordFieldError) {
      setPasswordFieldError('');
      setConfirmPasswordFieldError('');
    }
  }

  function handleSetPasswordApiErrors(errorCode) {
    switch (errorCode) {
      case 2:
        setPasswordFieldError(passwordErrorMessages.Flooded);
        break;
      case 7:
        setPasswordFieldError(passwordErrorMessages.InvalidPassword);
        break;
      case 9:
        setPasswordFieldError(passwordErrorMessages.AccessDenied);
        break;
      default:
        setPasswordFieldError(passwordErrorMessages.UnknownError);
    }
  }

  const handlePasswordEntered = async () => {
    sendFacebookSunsetEvent(events.setPasswordButtonClick);
    if (passwordFieldError || confirmPasswordFieldError) {
      return;
    }
    try {
      // oldPasswordPlaceholder is needed because the call to change password requires an old password
      // but facebook users do not have a password, so we pass in a value that is never checked
      const result = await setPassword(oldPasswordPlaceholder, passwordInput);
      if (result && result.data && result.data.errors && result.data.errors.length > 0) {
        handleSetPasswordApiErrors(result.data.errors[0].code);
        return;
      }
    } catch (e) {
      setPasswordFieldError(passwordErrorMessages.UnknownError);
      return;
    }
    sendFacebookSunsetEvent(events.setPasswordSuccess);
    disconnectFacebook();
    setHasUserAddedPassword(true);
  };

  function handlePasswordInputChange(event) {
    setPasswordInput(event.target.value);
  }

  function handleClickDone() {
    postModalActions.closeCallback(true);
    setModalOpen(false);
  }

  function handleConfirmPasswordInputChange(event) {
    setConfirmPasswordInput(event.target.value);
  }

  function handleModalDismiss() {
    setPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordFieldError('');
    setConfirmPasswordFieldError('');
    setModalOpen(false);
  }

  return (
    <FacebookSunsetModal
      show={isModalOpen}
      onHide={handleModalDismiss}
      translate={translate}
      passwordInputValue={passwordInput}
      confirmPasswordInputValue={confirmPasswordInput}
      handlePasswordEntered={() => handlePasswordEntered()}
      handlePasswordInputChange={handlePasswordInputChange}
      handleConfirmPasswordInputChange={handleConfirmPasswordInputChange}
      hasUserAddedPassword={hasUserAddedPassword}
      passwordFieldError={passwordFieldError}
      confirmPasswordFieldError={confirmPasswordFieldError}
      handleClickDone={handleClickDone}
    />
  );
}

FacebookSunsetContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default FacebookSunsetContainer;
