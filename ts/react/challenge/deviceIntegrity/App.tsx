import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { TRANSLATION_CONFIG } from './app.config';
import DeviceIntegrity from './containers/deviceIntegrity';
import {
  OnChallengeDisplayedCallback,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { DeviceIntegrityContextProvider } from './store/contextProvider';

type Props = {
  challengeId: string;
  integrityType: string;
  requestHash: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  challengeId,
  requestHash,
  integrityType,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  return (
    <DeviceIntegrityContextProvider
      challengeId={challengeId}
      requestHash={requestHash}
      integrityType={integrityType}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      translate={translate}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <DeviceIntegrity />
    </DeviceIntegrityContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
