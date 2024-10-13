import PropTypes from 'prop-types';
import React from 'react';
import { Link, Modal } from 'react-style-guide';
import { NavigationService, UpsellService } from 'Roblox';
import { contactMethodPromptStrings } from '../../common/constants/translationConstants';
import { supportPageUrl } from '../../common/constants/urlConstants';
import { sendVerificationUpsellEvent } from '../../common/utils/loggingUtils';
import { events } from '../constants/contactMethodPromptLoggingConstants';
import useContactMethodPromptModalState from '../hooks/useContactMethodPromptModalState';

function ContactMethodPrompt({ translate, onHide }) {
  const { contactMethodPromptModalState } = useContactMethodPromptModalState();
  const {
    HeadingVerificationRequired,
    HeadingDontGetLockedOut,
    LabelRecoverIfPasswordLost,
    HeadingImproveAccountSecurity,
    LabelKeepBadActorsOut,
    ActionAddPhoneNumber,
    ActionLogOutText,
    ActionSupport,
    ActionAddEmailAddress
  } = contactMethodPromptStrings;

  const onContactMethodCloseCallback = isContactMethodAdded => {
    if (!isContactMethodAdded) {
      UpsellService?.renderContactMethodPromptModal({
        origin: contactMethodPromptModalState.origin,
        section: contactMethodPromptModalState.section
      });
    }
  };

  const onPhoneClick = () => {
    onHide();
    sendVerificationUpsellEvent(events.contactMethodPromptPhoneClicked, {
      origin: contactMethodPromptModalState.origin,
      section: contactMethodPromptModalState.section
    });
    UpsellService?.renderPhoneUpsell({ onClose: onContactMethodCloseCallback });
  };

  const onEmailClick = () => {
    onHide();
    sendVerificationUpsellEvent(events.contactMethodPromptEmailClicked, {
      origin: contactMethodPromptModalState.origin,
      section: contactMethodPromptModalState.section
    });
    UpsellService?.renderEmailUpsell(onContactMethodCloseCallback);
  };

  const onSupportButtonClick = () => {
    sendVerificationUpsellEvent(events.contactMethodPromptSupportClicked, {
      origin: contactMethodPromptModalState.origin,
      section: contactMethodPromptModalState.section
    });
  };

  const onLogoutButtonClick = () => {
    sendVerificationUpsellEvent(events.contactMethodPromptLogoutClicked, {
      origin: contactMethodPromptModalState.origin,
      section: contactMethodPromptModalState.section
    });
    NavigationService.logoutAndRedirect();
  };

  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='verification-upsell-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate(HeadingVerificationRequired)}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className='verification-grid'>
        <span className='icon-spot-passcode-xl verification-grid-icon' />
        <div>
          <div className='verification-upsell-title-container page-title '>
            <div className='font-header-2'>{translate(HeadingDontGetLockedOut)}</div>
          </div>
          <div className='text-description'>{translate(LabelRecoverIfPasswordLost)}</div>
        </div>
        <span className='icon-spot-success-xl verification-grid-icon' />
        <div>
          <div className='verification-upsell-title-container page-title'>
            <div className='font-header-2'>{translate(HeadingImproveAccountSecurity)}</div>
          </div>
          <div className='text-description'>{translate(LabelKeepBadActorsOut)}</div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type='button'
          className='btn-cta-md btn-max-width phone-number-verify-button'
          onClick={onPhoneClick}>
          {translate(ActionAddPhoneNumber)}
        </button>
        <button
          type='button'
          className=' btn-secondary-md btn-max-width phone-number-resent-button'
          onClick={onEmailClick}>
          {translate(ActionAddEmailAddress)}
        </button>
        <div>
          <div className='contact-method-prompt-links'>
            <Link
              className='text-default contact-method-link-button'
              href={supportPageUrl}
              target='_blank'
              onClick={onSupportButtonClick}>
              {translate(ActionSupport)}
            </Link>
            <button
              type='button'
              className='text-default contact-method-link-button'
              onClick={onLogoutButtonClick}>
              {translate(ActionLogOutText)}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </div>
  );
}

ContactMethodPrompt.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired
};

export default ContactMethodPrompt;
