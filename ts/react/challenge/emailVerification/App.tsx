import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { TRANSLATION_CONFIG } from './app.config';
import EmailVerification from './containers/emailVerification';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { EmailVerificationContextProvider } from './store/contextProvider';

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
    <EmailVerificationContextProvider
      challengeId={challengeId}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      translate={translate}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <EmailVerification />
    </EmailVerificationContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
