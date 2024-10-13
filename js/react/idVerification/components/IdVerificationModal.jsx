import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
// prior to verification, user must have an email on file, so we need email upsell translations for this modal
import { emailUpsellTranslationConfig } from '../app.config';
import { DisplayView } from '../constants/viewConstants';
import useIdVerificationState from '../hooks/useIdVerificationState';

function IdVerificationModal({
  onHide,
  onPrimaryAction,
  onSecondaryAction,
  onInputChange,
  onInputFocus,
  onKeyDown,
  translate
}) {
  const { idVerificationState } = useIdVerificationState();
  const {
    pageName,
    titleText,
    bodyText,
    primaryButtonText,
    secondaryButtonText,
    userEmailInput,
    userEmailInputPlaceholder,
    userEmail,
    errorMsg,
    isEmailUpdating
  } = idVerificationState;
  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>{translate(titleText)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='email-upsell-image' />
        <p className='email-upsell-text-body'>{translate(bodyText, { emailAddress: userEmail })}</p>
        {pageName === DisplayView.EMAIL && (
          <input
            type='email'
            /* eslint-disable */
            autoFocus
            /* eslint-enable */
            className={`${
              errorMsg ? 'input-field-error' : ''
            } form-control input-field email-upsell-modal-input`}
            placeholder={translate(userEmailInputPlaceholder)}
            value={userEmailInput}
            onFocus={() => onInputFocus()}
            onChange={event => onInputChange(event.target.value)}
            onKeyDown={event => onKeyDown(event.key)}
          />
        )}
        {errorMsg && <p className='text-error modal-error-message'>{translate(errorMsg)}</p>}
      </Modal.Body>
      <Modal.Footer>
        <div className='email-upsell-footer-container'>
          {pageName === DisplayView.EMAIL && (
            <Button
              className='modal-button email-upsell-btn'
              variant={Button.variants.cta}
              size={Button.sizes.medium}
              isDisabled={isEmailUpdating}
              onClick={onPrimaryAction}>
              {translate(primaryButtonText)}
            </Button>
          )}
          {secondaryButtonText && (
            <button type='button' className='change-email-button' onClick={onSecondaryAction}>
              {translate(secondaryButtonText)}
            </button>
          )}
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
}

IdVerificationModal.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onPrimaryAction: PropTypes.func.isRequired,
  onSecondaryAction: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onInputFocus: PropTypes.func.isRequired
};

export default withTranslations(IdVerificationModal, emailUpsellTranslationConfig);
