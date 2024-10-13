import React from 'react';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { RequestService } from '../../../common/request';
import { TRANSLATION_CONFIG } from './app.config';
import Reauthentication from './containers/reauthentication';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
  ReauthenticationType,
  ReauthenticationMetadata
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { ReauthenticationContextProvider } from './store/contextProvider';

type Props = {
  renderInline: boolean;
  requestService: RequestService;
  metricsService: MetricsService;
  eventService: EventService;
  defaultType: ReauthenticationType;
  availableTypes: ReauthenticationType[];
  defaultTypeMetadata: ReauthenticationMetadata | null;
  shouldModifyBrowserHistory: boolean;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

export const App: React.FC<Props> = ({
  renderInline,
  requestService,
  metricsService,
  eventService,
  defaultType,
  availableTypes,
  defaultTypeMetadata,
  shouldModifyBrowserHistory,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  const ContextProviderElement = (
    <ReauthenticationContextProvider
      renderInline={renderInline}
      requestService={requestService}
      metricsService={metricsService}
      eventService={eventService}
      translate={translate}
      defaultType={defaultType}
      availableTypes={availableTypes}
      defaultTypeMetadata={defaultTypeMetadata}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <Reauthentication />
    </ReauthenticationContextProvider>
  );

  return shouldModifyBrowserHistory ? (
    <HashRouter hashType='noslash'>{ContextProviderElement}</HashRouter>
  ) : (
    // `MemoryRouter` maintains a path state just like a real router, but it
    // does not sync this state to anything (e.g. the URL bar). Since it has
    // the same API as `HashRouter`, we use it here to maintain reauthentication type
    // state in a generic way (without requiring branching logic based on the
    // `shouldModifyBrowserHistory` boolean).
    <MemoryRouter>{ContextProviderElement}</MemoryRouter>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
