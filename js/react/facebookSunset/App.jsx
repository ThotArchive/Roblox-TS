import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { socialTranslation } from './app.config';
import FacebookSunsetContainer from './container/FacebookSunsetContainer';

function App({ translate }) {
  return <FacebookSunsetContainer translate={translate} />;
}

App.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(App, socialTranslation);
