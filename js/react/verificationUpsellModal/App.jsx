import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import EmailUpsellModalContainer from './emailUpsellModal/container/EmailUpsellModalContainer';
import { EmailUpsellModalStateProvider } from './emailUpsellModal/stores/EmailUpsellModalStoreContext';

function App({ translate }) {
  return (
    <EmailUpsellModalStateProvider>
      <EmailUpsellModalContainer translate={translate} />
    </EmailUpsellModalStateProvider>
  );
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, translation);
