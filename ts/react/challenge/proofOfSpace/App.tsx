import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { RequestService } from '../../../common/request';
import { TRANSLATION_CONFIG } from './app.config';
import ProofOfSpace from './containers/proofOfSpace';
import {
  Artifacts,
  OnChallengeDisplayedCallback,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { ProofOfSpaceContextProvider } from './store/contextProvider';

type Props = {
  challengeId: string;
  renderInline: boolean;
  artifacts: Artifacts;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  challengeId,
  renderInline,
  artifacts,
  eventService,
  metricsService,
  requestService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  return (
    <ProofOfSpaceContextProvider
      challengeId={challengeId}
      renderInline={renderInline}
      artifacts={artifacts}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      translate={translate}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <ProofOfSpace />
    </ProofOfSpaceContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
