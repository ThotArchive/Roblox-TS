/* eslint-disable import/prefer-default-export */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import '../../../../css/challenge/twoStepVerification/twoStepVerification.scss';
import '../../../../css/common/inlineChallenge.scss';
import '../../../../css/common/modalModern.scss';
import '../../../../css/common/spinner.scss';
import { RequestServiceDefault } from '../../../common/request';
import App from './App';
import {
  LOG_PREFIX,
  TRANSLATION_CONFIG,
  TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES,
  TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES_NEW
} from './app.config';
import { RenderChallenge } from './interface';
import { EventServiceDefault } from './services/eventService';
import { MetricsServiceDefault } from './services/metricsService';

// Global instance since we do not need 2SV parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ActionType, ErrorCode, MediaType } from './interface';

/**
 * Renders the 2SV Challenge UI for a given set of parameters. Returns whether
 * the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  userId,
  challengeId,
  appType,
  actionType,
  renderInline,
  shouldModifyBrowserHistory,
  shouldShowRememberDeviceCheckbox,
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
    const eventService = new EventServiceDefault(challengeId, userId);
    const metricsService = new MetricsServiceDefault(actionType, appType, requestServiceDefault);

    // Render the app on the selected element.
    render(
      <App
        userId={userId}
        challengeId={challengeId}
        actionType={actionType}
        renderInline={renderInline}
        shouldModifyBrowserHistory={shouldModifyBrowserHistory || false}
        shouldShowRememberDeviceCheckbox={shouldShowRememberDeviceCheckbox}
        eventService={eventService}
        metricsService={metricsService}
        requestService={requestServiceDefault}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      container
    );
    eventService.sendChallengeInitializedEvent();
    metricsService.fireInitializedEvent();
    return true;
  }

  return false;
};
