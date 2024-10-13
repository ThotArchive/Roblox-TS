import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Modal } from 'react-style-guide';
import { sendVerificationUpsellEvent } from '../../common/utils/loggingUtils';
import { CLOSE_CONTACT_METHOD_PROMPT_MODAL, SET_LOGGING_VALUES } from '../actions/actionTypes';
import ContactMethodPrompt from '../components/ContactMethodPrompt';
import { events } from '../constants/contactMethodPromptLoggingConstants';
import useContactMethodPromptModalState from '../hooks/useContactMethodPromptModalState';

function ContactMethodPromptModalContainer({ translate, origin, section }) {
  const { contactMethodPromptModalState, dispatch } = useContactMethodPromptModalState();

  const onHide = () => {
    sendVerificationUpsellEvent(events.contactMethodPromptDismissed, {
      origin: contactMethodPromptModalState.origin,
      section: contactMethodPromptModalState.section
    });
    dispatch({ type: CLOSE_CONTACT_METHOD_PROMPT_MODAL });
  };
  const modalContent = () => {
    return <ContactMethodPrompt translate={translate} onHide={onHide} />;
  };
  useEffect(() => {
    dispatch({ type: SET_LOGGING_VALUES, origin, section });
  }, []);

  useEffect(() => {
    if (contactMethodPromptModalState.origin && contactMethodPromptModalState.section) {
      // log impression only if origin and section are set to non empty values.
      sendVerificationUpsellEvent(events.contactMethodPromptShown, {
        origin: contactMethodPromptModalState.origin,
        section: contactMethodPromptModalState.section
      });
    }
  }, [contactMethodPromptModalState.origin, contactMethodPromptModalState.section]);

  return (
    <Modal
      show={contactMethodPromptModalState.isOpen}
      onHide={onHide}
      keyboard={false} // prevent ESC key from dismissing the modal
      className='verification-modal'
      backdrop='static' // prevent clicking on the backdrop to close the modal
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered='true'>
      {modalContent()}
    </Modal>
  );
}
ContactMethodPromptModalContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  section: PropTypes.string.isRequired,
  origin: PropTypes.string.isRequired
};

export default ContactMethodPromptModalContainer;
