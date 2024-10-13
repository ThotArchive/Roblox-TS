// Duplicated from Roblox.CoreScripts.WebApp/js/utilities/boundAuthTokens/utils/eventUtil.ts.
// TODO: Can this login/signup-specific logic be unified with the CoreScripts logic?
import { eventStreamService } from 'core-roblox-utilities';
import { Tracker, Configuration, TrackerRequest } from '@rbx/event-stream';
import { EnvironmentUrls } from 'Roblox';
import EVENT_CONSTANTS from '../constants/eventsConstants';

// eventStreamService is not applicable for Edu, as it still uses the normal
// base URL (roblox.com), which would be blocked by school content filters.
// We are using the newer @rbx/event-stream library which allows us to
// override the base URL.
const eduSsoEventStreamConfiguration = new Configuration({
  baseUrl: `${EnvironmentUrls.eduWebsiteUrl.replace('www', 'ecsv2')}/www`
});
const eduSsoTracker = new Tracker(eduSsoEventStreamConfiguration);

export const sendSAISuccessEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiCreated,
    EVENT_CONSTANTS.context.hba,
    {}
  );
};

type SaiGenerationErrorInfo = {
  message: string;
  // TODO: Add discrete error kinds here...
};

export const sendSAIMissingEvent = (errorInfo: SaiGenerationErrorInfo): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiMissing,
    EVENT_CONSTANTS.context.hba,
    {
      messageRaw: errorInfo.message
    }
  );
};

type SsoContextType =
  | typeof EVENT_CONSTANTS.context.ssoLtiInit
  | typeof EVENT_CONSTANTS.context.ssoLtiLaunch
  | typeof EVENT_CONSTANTS.context.ssoError;

type SsoButtonType = typeof EVENT_CONSTANTS.btn.launchSsoDeeplink;

type SsoErrorType = typeof EVENT_CONSTANTS.clientErrorTypes.pageLoadFailed;

export const sendEduSsoPageLoadEvent = (context: SsoContextType): void => {
  const request: TrackerRequest = {
    target: 'www',
    localTime: new Date(),
    eventType: EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    context
  };
  eduSsoTracker.sendEventViaImg(request);
};

export const sendEduSsoButtonClickEvent = (
  context: SsoContextType,
  btn: SsoButtonType,
  state?: string
): void => {
  const request: TrackerRequest = {
    target: 'www',
    localTime: new Date(),
    eventType: EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    context,
    additionalProperties: {
      btn,
      state
    }
  };
  eduSsoTracker.sendEventViaImg(request);
};

export const sendEduSsoErrorEvent = (context: SsoContextType, errorType: SsoErrorType): void => {
  const request: TrackerRequest = {
    target: 'www',
    localTime: new Date(),
    eventType: EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    context,
    additionalProperties: {
      state: errorType
    }
  };
  eduSsoTracker.sendEventViaImg(request);
};

export default {
  sendEduSsoPageLoadEvent,
  sendEduSsoButtonClickEvent,
  sendEduSsoErrorEvent,
  sendSAISuccessEvent,
  sendSAIMissingEvent
};
