import { eventStreamService } from 'core-roblox-utilities';
import RequestType from '../enums/RequestType';
import parentalRequestConstants from '../constants/parentalRequestConstants';

type TEventParams = {
  requestType: RequestType;
  extraState?: string;
  sessionId?: string;
  settingName?: string;
};

const { events } = parentalRequestConstants;
const generateState = (sessionId?: string, extraState?: string, settingName?: string) => {
  const extraStateString = extraState ? `${extraState}, ` : '';
  const sessionIdString = sessionId ? `sessionId: ${sessionId}, ` : '';
  const settingNameString = settingName ? `settingName: ${settingName}, ` : '';
  return `${extraStateString}${settingNameString}${sessionIdString}`;
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
    case RequestType.UpdateUserSetting:
      context = events.updateUserSettingContext;
      break;
    default:
      context = events.chargebackContext;
  }
  return context;
};

export const sendLoadRequestBroadcastEvent = ({
  requestType,
  sessionId,
  extraState,
  settingName
}: TEventParams): void => {
  const context = getContext(requestType);
  eventStreamService.sendEventWithTarget(
    events.eventName.authPageLoad,
    context.settingsRequestSent,
    {
      state: generateState(sessionId, extraState, settingName),
      associatedText: events.text.requestSent
    }
  );
};

export const sendClickRequestBroadcastConfirmEvent = ({
  requestType,
  sessionId,
  extraState,
  settingName
}: TEventParams): void => {
  const context = getContext(requestType);
  eventStreamService.sendEventWithTarget(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.continue,
    associatedText: events.text.ok,
    state: generateState(sessionId, extraState, settingName)
  });
};
export const sendParentEmailSubmitEvent = ({
  requestType,
  sessionId,
  settingName
}: TEventParams): void => {
  const context = getContext(requestType);

  eventStreamService.sendEventWithTarget(events.eventName.authButtonClick, context.parentalEntry, {
    btn: events.btn.submit,
    associatedText: events.text.sendEmail,
    state: generateState(sessionId, undefined, settingName)
  });
};

export const sendInteractParentEmailFormEvent = ({
  requestType,
  settingName
}: TEventParams): void => {
  const context = getContext(requestType);
  eventStreamService.sendEventWithTarget(
    events.eventName.authFormInteraction,
    context.parentalEntry,
    {
      field: events.field.email,
      associatedText: events.text.enterParentEmail,
      state: generateState(undefined, undefined, settingName)
    }
  );
};
