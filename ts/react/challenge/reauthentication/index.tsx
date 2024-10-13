/* eslint-disable import/prefer-default-export */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import '../../../../css/common/modalModern.scss';
import '../../../../css/common/spinner.scss';
import { RequestServiceDefault } from '../../../common/request';
import { ChallengeError, ChallengeErrorKind, ChallengeType } from '../generic';
import App from './App';
import { LOG_PREFIX, REAUTHENTICATION_LANGUAGE_RESOURCES, TRANSLATION_CONFIG } from './app.config';
import { RenderChallenge } from './interface';
import { EventServiceDefault } from './services/eventService';
import { MetricsServiceDefault } from './services/metricsService';

// Global instance since we do not need Re-authentication parameters for
// instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode, ReauthenticationType } from './interface';

/**
 * Renders the Re-authentication Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  renderInline,
  defaultType,
  availableTypes,
  defaultTypeMetadata,
  shouldModifyBrowserHistory,
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
    const eventService = new EventServiceDefault(defaultType);
    const metricsService = new MetricsServiceDefault(defaultType, requestServiceDefault);

    // Render the app on the selected element.
    render(
      <App
        renderInline={renderInline}
        requestService={requestServiceDefault}
        metricsService={metricsService}
        eventService={eventService}
        defaultType={defaultType}
        availableTypes={availableTypes}
        defaultTypeMetadata={defaultTypeMetadata}
        shouldModifyBrowserHistory={shouldModifyBrowserHistory || false}
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

export const reauthInvalidationErrorMessageOrNull = (error: unknown): string | null => {
  return ChallengeError.match(error) &&
    error.parameters.data.challengeType === ChallengeType.REAUTHENTICATION &&
    error.parameters.kind === ChallengeErrorKind.INVALIDATED &&
    error.parameters.data.errorMessage !== ''
    ? error.parameters.data.errorMessage
    : null;
};
