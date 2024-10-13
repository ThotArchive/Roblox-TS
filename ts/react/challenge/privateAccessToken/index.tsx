/* eslint-disable import/prefer-default-export */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { RequestServiceDefault } from '../../../common/request';
import App from './App';
import {
  LOG_PREFIX,
  TRANSLATION_CONFIG,
  PRIVATE_ACCESS_TOKEN_LANGUAGE_RESOURCES
} from './app.config';
import { RenderChallenge } from './interface';
import { EventServiceDefault } from './services/eventService';
import { MetricsServiceDefault } from './services/metricsService';

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode } from './interface';

// Global instance since we do not need Private-Access-Token parameters for
// instantiation.
const requestServiceDefault = new RequestServiceDefault();

/**
 * Renders the Private-Access-Token Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  challengeId,
  appType,
  renderInline,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}) => {
  const container = document.getElementById(containerId);
  if (container !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault(challengeId);
    const metricsService = new MetricsServiceDefault(appType, requestServiceDefault);

    // Render the app on the selected element.
    render(
      <App
        challengeId={challengeId}
        renderInline={renderInline}
        eventService={eventService}
        metricsService={metricsService}
        requestService={requestServiceDefault}
        onChallengeDisplayed={onChallengeDisplayed}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      container
    );
    eventService.sendChallengeInitializedEvent();
    metricsService.fireChallengeInitializedEvent();
    return true;
  }

  return false;
};
