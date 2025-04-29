import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { TRANSLATION_CONFIG } from './app.config';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { PhoneVerificationContextProvider } from './store/contextProvider';
import PhoneVerification from './containers/phoneVerification';

type Props = {
  challengeId: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  challengeId,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  return (
    <PhoneVerificationContextProvider
      challengeId={challengeId}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      translate={translate}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <PhoneVerification />
    </PhoneVerificationContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
