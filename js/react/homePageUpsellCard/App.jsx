import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import HomePageUpsellContainer from './container/homePageUpsellCardContainer';
import { UpsellCardType } from './constants/upsellCardConstants';

function App({ translate, context }) {
  return <HomePageUpsellContainer translate={translate} context={context} />;
}

App.defaultProps = {
  context: UpsellCardType.ContactMethod
};

App.propTypes = {
  translate: PropTypes.func.isRequired,
  context: PropTypes.string
};

export default withTranslations(App, translation);
