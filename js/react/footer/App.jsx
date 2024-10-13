import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translationConfig } from './app.config';
import Footer from './components/Footer';

function App({ translate, intl }) {
  return <Footer translate={translate} intl={intl} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired
};

export default withTranslations(App, translationConfig);
