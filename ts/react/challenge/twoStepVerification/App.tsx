import React from 'react';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { RequestService } from '../../../common/request';
import { TRANSLATION_CONFIG } from './app.config';
import TwoStepVerification from './containers/twoStepVerification';
import {
  ActionType,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { TwoStepVerificationContextProvider } from './store/contextProvider';

type Props = {
  userId: string;
  challengeId: string;
  actionType: ActionType;
  renderInline: boolean;
  shouldModifyBrowserHistory: boolean;
  shouldShowRememberDeviceCheckbox: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

export const App: React.FC<Props> = ({
  userId,
  challengeId,
  actionType,
  renderInline,
  shouldModifyBrowserHistory,
  shouldShowRememberDeviceCheckbox,
  eventService,
  metricsService,
  requestService,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  const ContextProviderElement = (
    <TwoStepVerificationContextProvider
      userId={userId}
      challengeId={challengeId}
      actionType={actionType}
      renderInline={renderInline}
      shouldShowRememberDeviceCheckbox={shouldShowRememberDeviceCheckbox}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      translate={translate}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <TwoStepVerification />
    </TwoStepVerificationContextProvider>
  );

  return shouldModifyBrowserHistory ? (
    <HashRouter hashType='noslash'>{ContextProviderElement}</HashRouter>
  ) : (
    // `MemoryRouter` maintains a path state just like a real router, but it
    // does not sync this state to anything (e.g. the URL bar). Since it has
    // the same API as `HashRouter`, we use it here to maintain media type
    // state in a generic way (without requiring branching logic based on the
    // `shouldModifyBrowserHistory` boolean).
    <MemoryRouter>{ContextProviderElement}</MemoryRouter>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
