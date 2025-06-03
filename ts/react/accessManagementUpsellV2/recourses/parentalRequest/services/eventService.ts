import { eventStreamService } from 'core-roblox-utilities';
import RequestType from '../enums/RequestType';
import PunishmentType from '../enums/PunishmentType';
import parentalRequestConstants from '../constants/parentalRequestConstants';

type TEventParams = {
  requestType: RequestType;
  extraState?: string;
  sessionId?: string;
  details?: Record<string, unknown>;
};

const { events } = parentalRequestConstants;
const generateState = (
  requestType: RequestType,
  sessionId?: string,
  extraState?: string,
  requestDetails?: Record<string, unknown>
) => {
  const extraStateString = extraState ? `${extraState}, ` : '';
  const sessionIdString = sessionId ? `sessionId: ${sessionId}, ` : '';
  const settingNameString = requestDetails
    ? `settingName: ${Object.keys(requestDetails)[0]}, `
    : '';
  const requestDetailsString = requestDetails
    ? Object.entries(requestDetails)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(', ')
    : '';
  switch (requestType) {
    case RequestType.UpdateUserSetting:
      return `${extraStateString}${settingNameString}${sessionIdString}`;
    default:
      return `${extraStateString}${requestDetailsString}${sessionIdString}`;
  }
};

const getContext = (requestType: RequestType, details: Record<string, unknown>) => {
  let context;
  switch (requestType) {
    case RequestType.LiftPunishment: {
      if (details?.punishmentType === PunishmentType.Chargeback) {
        context = events.chargebackContext;
      }
      break;
    }
    case RequestType.SavePaymentMethods:
      context = events.savePaymentMethodsContext;
      break;
    case RequestType.UpdateBirthdate:
      context = events.changeBirthdayContext;
      break;
    case RequestType.UpdateUserSetting:
      context = events.updateUserSettingContext;
      break;
    default:
      context = events.chargebackContext;
  }
  return context;
};

const sendEventWithSilentError = (
  eventName: string,
  context: string,
  additionalProperties: Record<string, string | number>
) => {
  try {
    eventStreamService.sendEventWithTarget(eventName, context, additionalProperties);
  } catch (error) {
    // silent error
  }
};

export const sendLoadRequestBroadcastEvent = ({
  requestType,
  sessionId,
  extraState,
  details
}: TEventParams): void => {
  const context = getContext(requestType, details);
  sendEventWithSilentError(events.eventName.authPageLoad, context.settingsRequestSent, {
    state: generateState(requestType, sessionId, extraState, details),
    associatedText: events.text.requestSent
  });
};

export const sendClickRequestBroadcastConfirmEvent = ({
  requestType,
  sessionId,
  extraState,
  details
}: TEventParams): void => {
  const context = getContext(requestType, details);
  sendEventWithSilentError(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.continue,
    associatedText: events.text.ok,
    state: generateState(requestType, sessionId, extraState, details)
  });
};
export const sendParentEmailSubmitEvent = ({
  requestType,
  sessionId,
  details
}: TEventParams): void => {
  const context = getContext(requestType, details);

  sendEventWithSilentError(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.submit,
    associatedText: events.text.sendEmail,
    state: generateState(requestType, sessionId, undefined, details)
  });
};

export const sendInteractParentEmailFormEvent = ({ requestType, details }: TEventParams): void => {
  const context = getContext(requestType, details);
  sendEventWithSilentError(events.eventName.authFormInteraction, context.parentalEntry, {
    field: events.field.email,
    associatedText: events.text.enterParentEmail,
    state: generateState(requestType, undefined, undefined, details)
  });
};
