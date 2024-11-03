import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-style-guide';
import FbSunsetAddPasswordModalContent from './FbSunsetAddPasswordModalContent';
import FbSunsetSuccessModalContent from './FbSunsetSuccessModalContent';

function FacebookSunsetModal({
  show,
  onHide,
  translate,
  passwordInputValue,
  confirmPasswordInputValue,
  handlePasswordEntered,
  handlePasswordInputChange,
  handleConfirmPasswordInputChange,
  hasUserAddedPassword,
  passwordFieldError,
  confirmPasswordFieldError,
  handleClickDone
}) {
  return (
    <Modal show={show} onHide={onHide} className='facebook-sunset-modal' size='lg' centered='true'>
      {hasUserAddedPassword ? (
        <FbSunsetSuccessModalContent translate={translate} handleClickDone={handleClickDone} />
      ) : (
        <FbSunsetAddPasswordModalContent
          translate={translate}
          onHide={onHide}
          passwordInputValue={passwordInputValue}
          confirmPasswordInputValue={confirmPasswordInputValue}
          handlePasswordEntered={handlePasswordEntered}
          handlePasswordInputChange={handlePasswordInputChange}
          handleConfirmPasswordInputChange={handleConfirmPasswordInputChange}
          passwordFieldError={passwordFieldError}
          confirmPasswordFieldError={confirmPasswordFieldError}
        />
      )}
    </Modal>
  );
}

FacebookSunsetModal.propTypes = {
  translate: PropTypes.func.isRequired,
  passwordInputValue: PropTypes.string.isRequired,
  confirmPasswordInputValue: PropTypes.string.isRequired,
  handlePasswordEntered: PropTypes.func.isRequired,
  handlePasswordInputChange: PropTypes.func.isRequired,
  handleConfirmPasswordInputChange: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  hasUserAddedPassword: PropTypes.bool.isRequired,
  passwordFieldError: PropTypes.string.isRequired,
  confirmPasswordFieldError: PropTypes.string.isRequired,
  handleClickDone: PropTypes.bool.isRequired
};

export default FacebookSunsetModal;
