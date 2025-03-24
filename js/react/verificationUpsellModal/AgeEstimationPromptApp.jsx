import PropTypes from 'prop-types';
import React from 'react';
import { withTranslations } from 'react-utilities';
import AgeEstimationPromptContainer from './ageEstimationPromptModal/containers/AgeEstimationPromptContainer';
import { AgeEstimationPromptModalStateProvider } from './ageEstimationPromptModal/stores/AgeEstimationPromptModalStoreContext';
import { translation } from './app.config';

function AgeEstimationPromptApp({ translate }) {
  return (
    <AgeEstimationPromptModalStateProvider>
      <AgeEstimationPromptContainer translate={translate} />
    </AgeEstimationPromptModalStateProvider>
  );
}

AgeEstimationPromptApp.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(AgeEstimationPromptApp, translation);
