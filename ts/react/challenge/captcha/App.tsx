import React from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { RequestService } from '../../../common/request';
import { GetMetadataReturnType } from '../../../common/request/types/captcha';
import { FUNCAPTCHA_VERSION_V2, TRANSLATION_CONFIG } from './app.config';
import CaptchaV1 from './containers/captchaV1';
import CaptchaV2 from './containers/captchaV2';
import {
  ActionType,
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from './interface';
import { EventService } from './services/eventService';
import { MetricsService } from './services/metricsService';
import { CaptchaContextProvider } from './store/contextProvider';

type Props = {
  actionType: ActionType;
  appType: string | null;
  dataExchangeBlob: string;
  unifiedCaptchaId: string;
  captchaVersion: string;
  renderInline: boolean;
  requestService: RequestService;
  metadataResponse: GetMetadataReturnType;
  eventService: EventService;
  metricsService: MetricsService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

export const App: React.FC<Props> = ({
  actionType,
  appType,
  dataExchangeBlob,
  unifiedCaptchaId,
  captchaVersion,
  renderInline,
  requestService,
  metadataResponse,
  eventService,
  metricsService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned
}: Props) => {
  return (
    <CaptchaContextProvider
      actionType={actionType}
      appType={appType}
      dataExchangeBlob={dataExchangeBlob}
      unifiedCaptchaId={unifiedCaptchaId}
      renderInline={renderInline}
      requestService={requestService}
      translate={translate}
      metadataResponse={metadataResponse}
      eventService={eventService}
      metricsService={metricsService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      {captchaVersion === FUNCAPTCHA_VERSION_V2 ? <CaptchaV2 /> : <CaptchaV1 />}
    </CaptchaContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
