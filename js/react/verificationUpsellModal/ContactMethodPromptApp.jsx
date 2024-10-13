import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import { ContactMethodPromptModalStateProvider } from './contactMethodPromptModal/stores/ContactMethodPromptModalStoreContext';
import ContactMethodPromptModalContainer from './contactMethodPromptModal/container/ContactMethodPromptModalContainer';

function ContactMethodPromptApp({ translate, origin, section }) {
  return (
    <ContactMethodPromptModalStateProvider>
      <ContactMethodPromptModalContainer translate={translate} origin={origin} section={section} />
    </ContactMethodPromptModalStateProvider>
  );
}

ContactMethodPromptApp.propTypes = {
  translate: PropTypes.func.isRequired,
  origin: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired
};

export default withTranslations(ContactMethodPromptApp, translation);
