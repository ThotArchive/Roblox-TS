import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import useEmailUpsellState from '../hooks/useEmailUpsellState';

const { isAndroidApp } = DeviceMeta ? DeviceMeta() : false;

function EmailUpsellModal({
  show,
  onHide,
  onPrimaryAction,
  onSecondaryAction,
  onInputChange,
  onBackAction,
  onInputFocus,
  onKeyDown,
  translate
}) {
  const { emailUpsellState } = useEmailUpsellState();
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
    isEmailSent,
    isEmailUpdating
  } = emailUpsellState;

  const isUnder13 = authenticatedUser?.isUnder13;

  return (
    <Modal
      show={show}
      onHide={onHide}
      /* eslint-enable */
      className={`${isAndroidApp ? 'verification-android-modal' : ''} verification-modal`}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered='true'>
      <Modal.Header useBaseBootstrapComponent>
        <div className='verification-upsell-title-container'>
          {pageName === verificationUpsellConstants.UpdatePassword ? (
            <button
              type='button'
              className='verification-upsell-title-button'
              onClick={onBackAction}>
              <span className='icon-back' />
            </button>
          ) : (
            <button type='button' className='verification-upsell-title-button' onClick={onHide}>
              <span className='close icon-close' />
            </button>
          )}
          <Modal.Title id='contained-modal-title-vcenter'>{translate(titleText)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='email-verification-upsell-image' />
        <p className='verification-upsell-text-body'>
          {translate(bodyText, { emailAddress: userEmail })}
        </p>
        {pageName === verificationUpsellConstants.UpdateEmail && (
          <input
            type='email'
            /* eslint-disable */
            autoFocus
            /* eslint-enable */
            className={`${
              errorMsg ? 'input-field-error' : ''
            } form-control input-field verification-upsell-modal-input`}
            placeholder={translate(userEmailInputPlaceholder)}
            autoComplete='email'
            value={userEmailInput}
            onChange={event => onInputChange(event.target.value)}
            onFocus={() => onInputFocus()}
            onKeyDown={event => onKeyDown(event.key)}
          />
        )}
        {errorMsg && (
          <p className='text-error modal-error-message sms-code-error'>{translate(errorMsg)}</p>
        )}
        {pageName === verificationUpsellConstants.UpdateEmail && isUnder13 && (
          <div className='privacy-policy-button'>
            <a
              href={verificationUpsellConstants.PrivacyPolicyLink}
              target='_blank'
              rel='noreferrer'>
              {translate(verificationUpsellConstants.ActionPrivacyPolicy)}
            </a>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className='verification-upsell-footer-container'>
          {pageName !== verificationUpsellConstants.Verification && (
            <Button
              className='modal-button verification-upsell-btn'
              variant={Button.variants.cta}
              size={Button.sizes.medium}
              isDisabled={isEmailUpdating}
              onClick={onPrimaryAction}>
              {translate(primaryButtonText)}
            </Button>
          )}
          {pageName === verificationUpsellConstants.Verification && (
            <button
              type='button'
              className={`${
                isEmailSent ? 'resend-button-disabled' : ''
              } resend-verification-email-button`}
              disabled={isEmailSent || errorMsg}
              onClick={onPrimaryAction}>
              {translate(primaryButtonText)}
            </button>
          )}
          {secondaryButtonText && (
            <button type='button' className='change-email-button' onClick={onSecondaryAction}>
              {translate(secondaryButtonText)}
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

EmailUpsellModal.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onPrimaryAction: PropTypes.func.isRequired,
  onSecondaryAction: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onBackAction: PropTypes.func.isRequired,
  onInputFocus: PropTypes.func.isRequired
};

export default EmailUpsellModal;
