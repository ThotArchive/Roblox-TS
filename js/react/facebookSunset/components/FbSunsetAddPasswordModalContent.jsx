import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-style-guide';
import PasswordErrorText from './PasswordErrorText';

function FbSunsetAddPasswordModalContent({
  translate,
  onHide,
  passwordInputValue,
  confirmPasswordInputValue,
  handlePasswordEntered,
  handlePasswordInputChange,
  handleConfirmPasswordInputChange,
  passwordFieldError,
  confirmPasswordFieldError
}) {
  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='facebook-sunset-modal-title-container'>
          <button type='button' className='facebook-sunset-title-button' onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.AddPassword')}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className='add-password-modal-image' />
          <div className='add-password-modal-body-text'>
            {translate('Description.AddPasswordModal')}
          </div>
          <form>
            <input
              className={`${
                passwordFieldError ? 'input-field-error' : ''
              } form-control input-field password-input `}
              type='password'
              placeholder={translate('Placeholder.CreatePassword')}
              value={passwordInputValue}
              onChange={handlePasswordInputChange}
            />
            {passwordFieldError && (
              <PasswordErrorText passwordError={passwordFieldError} translate={translate} />
            )}
            <input
              className={`${
                confirmPasswordFieldError ? 'input-field-error' : ''
              } form-control input-field password-input `}
              type='password'
              placeholder={translate('Placeholder.ConfirmPassword')}
              value={confirmPasswordInputValue}
              onChange={handleConfirmPasswordInputChange}
            />
            {confirmPasswordFieldError && (
              <PasswordErrorText passwordError={confirmPasswordFieldError} translate={translate} />
            )}
          </form>
        </div>
        <Button
          className='modal-button facebook-sunset-btn'
          variant={Button.variants.cta}
          size={Button.sizes.medium}
          onClick={handlePasswordEntered}>
          {translate('Action.Continue')}
        </Button>
      </Modal.Body>
    </div>
  );
}

FbSunsetAddPasswordModalContent.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  passwordInputValue: PropTypes.string.isRequired,
  confirmPasswordInputValue: PropTypes.string.isRequired,
  handlePasswordEntered: PropTypes.func.isRequired,
  handlePasswordInputChange: PropTypes.func.isRequired,
  handleConfirmPasswordInputChange: PropTypes.func.isRequired,
  passwordFieldError: PropTypes.string.isRequired,
  confirmPasswordFieldError: PropTypes.string.isRequired
};

export default FbSunsetAddPasswordModalContent;
