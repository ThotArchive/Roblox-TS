import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { verificationTranslationConfig } from './app.config';
import IdVerificationContainer from './container/IdVerificationContainer';
import { IdVerificationStateProvider } from './stores/IdVerificationStoreContext';
import { ModalEntry } from './constants/viewConstants';

function App({ translate, entry }) {
  return (
    <IdVerificationStateProvider>
      <IdVerificationContainer translate={translate} entry={entry} />
    </IdVerificationStateProvider>
  );
}

App.defaultProps = {
  entry: ModalEntry.WebApp
};

App.propTypes = {
  translate: PropTypes.func.isRequired,
  entry: PropTypes.string
};

export default withTranslations(App, verificationTranslationConfig);
