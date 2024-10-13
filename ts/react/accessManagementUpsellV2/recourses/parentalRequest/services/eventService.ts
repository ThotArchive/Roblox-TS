import { eventStreamService } from 'core-roblox-utilities';
import RequestType from '../enums/RequestType';
import parentalRequestConstants from '../constants/parentalRequestConstants';

const { events } = parentalRequestConstants;
const generateState = (sessionId?: string, extraState?: string) => {
  const extraStateString = extraState ? `${extraState}, ` : '';
  const sessionIdString = sessionId ? `sessionId: ${sessionId}, ` : '';
  return `${extraStateString}${sessionIdString}`;
};

const getContext = (requestType: RequestType) => {
  let context;
  switch (requestType) {
    case RequestType.ChargebackReenableAccount:
      context = events.chargebackContext;
      break;
    case RequestType.SavePaymentMethods:
      context = events.savePaymentMethodsContext;
      break;
    case RequestType.UpdateBirthdate:
      context = events.changeBirthdayContext;
      break;
    default:
      context = events.chargebackContext;
  }
  return context;
};

export const sendLoadRequestBroadcastEvent = (
  requestType: RequestType,
  extraState: string,
  sessionId?: string
): void => {
  const context = getContext(requestType);
  eventStreamService.sendEventWithTarget(
    events.eventName.authPageLoad,
    context.settingsRequestSent,
    {
      state: generateState(sessionId, extraState),
      associatedText: events.text.requestSent
    }
  );
};

export const sendClickRequestBroadcastConfirmEvent = (
  requestType: RequestType,
  extraState: string,
  sessionId?: string
): void => {
  const context = getContext(requestType);
  eventStreamService.sendEventWithTarget(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.continue,
    associatedText: events.text.ok,
    state: generateState(sessionId, extraState)
  });
};
export const sendParentEmailSubmitEvent = (consentType: RequestType, sessionId?: string): void => {
  const context = getContext(consentType);

  eventStreamService.sendEventWithTarget(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.submit,
    associatedText: events.text.sendEmail,
    state: generateState(sessionId)
  });
};

export const sendInteractParentEmailFormEvent = (consentType: RequestType): void => {
  const context = getContext(consentType);
  eventStreamService.sendEventWithTarget(
    events.eventName.authFormInteraction,
    context.parentalEntry,
    {
      field: events.field.email,
      associatedText: events.text.enterParentEmail
    }
  );
};
