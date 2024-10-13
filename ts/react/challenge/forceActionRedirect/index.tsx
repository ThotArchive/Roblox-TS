/* eslint-disable import/prefer-default-export */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { withTranslations } from 'react-utilities';
import '../../../../css/common/modalModern.scss';
import '../../../../css/common/spinner.scss';
import { RequestServiceDefault } from '../../../common/request';
import App from './App';
import { LOG_PREFIX, getForceActionRedirectChallengeConfig } from './app.config';
import { RenderChallenge } from './interface';

// Global instance since we do not need force authenticator parameters for
// instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode, ForceActionRedirectChallengeType } from './interface';

/**
 * Renders the Force Authenticator Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  renderInline,
  forceActionRedirectChallengeType,
  onModalChallengeAbandoned
}) => {
  const container = document.getElementById(containerId);

  // Retrieve config specific for the forceActionRedirectChallengeType.
  const forceActionRedirectChallengeConfig = getForceActionRedirectChallengeConfig(
    forceActionRedirectChallengeType
  );

  if (container !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    // Wrapping with translations needs to be done here as translationConfig
    // can vary based upon forceActionRedirectChallengeType.
    const AppWithTranslations = withTranslations(
      App,
      forceActionRedirectChallengeConfig.translationConfig
    );

    // Render the app on the selected element.
    render(
      <AppWithTranslations
        forceActionRedirectChallengeConfig={forceActionRedirectChallengeConfig}
        renderInline={renderInline}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      container
    );
    return true;
  }

  return false;
};
