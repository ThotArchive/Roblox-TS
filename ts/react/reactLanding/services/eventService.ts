import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { counters } from '../constants/signupConstants';
import RobloxEventTracker from '../../common/eventTracker';
import VerifiedParentalConsentRequestType from '../enums/VerifiedParentalConsentRequestType';

const { eventTypes } = eventStreamService;

const getVPCEventContext = (requestType: VerifiedParentalConsentRequestType) => {
  let context;
  switch (requestType) {
    case VerifiedParentalConsentRequestType.ChargebackReenableAccount:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.chargeback;
      break;
    case VerifiedParentalConsentRequestType.SavePaymentMethods:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.savePaymentMethods;
      break;
    case VerifiedParentalConsentRequestType.UpdateBirthdate:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.changeBirthdayContext;
      break;
    default:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.chargeback;
  }
  return context;
};

export const incrementEphemeralCounter = (eventName: string): void => {
  if (RobloxEventTracker && eventName) {
    RobloxEventTracker.fireEvent(counters.prefix + eventName);
  }
};

export const sendConversionEvent = (callback: () => void): void => {
  const gtag = window.gtag || null;
  if (typeof gtag === 'undefined' || !gtag || !gtag.conversionEvents) {
    callback();
    return;
  }
  // In case gtag fails
  const id = setTimeout(callback, 2000);
  gtag('event', 'conversion', {
    send_to: gtag.conversionEvents.signupConversionEvent,
    event_callback() {
      clearTimeout(id);
      callback();
    },
    event_timeout: 2000
  });
};

export const sendQualifiedSignupEvent = (
  referralUrl: string,
  linkId: string,
  status: 'initial' | 'error'
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.qualifiedSignup,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      status,
      referralUrl,
      linkId
    }
  );
};

export const sendSignupButtonClickEvent = (isAltAttempt: boolean, hasAuthIntent = false): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      btn: EVENT_CONSTANTS.field.signupSubmitButtonName,
      state: hasAuthIntent ? EVENT_CONSTANTS.field.hasAuthIntent : '',
      isAltAttempt: isAltAttempt ? 'true' : 'false'
    }
  );
  // doube sending to the old origin as well
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.signupForm,
    {
      field: EVENT_CONSTANTS.field.signupSubmitButtonName,
      aType: EVENT_CONSTANTS.aType.click
    }
  );
};

export const sendSignupUsernameKeystrokeEvent = (
  keyPressedData: string,
  eventTypeData: string,
  timestampData: string
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.signupUsernameKeystrokes,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      keyPressedData: JSON.stringify(keyPressedData),
      eventTypeData: JSON.stringify(eventTypeData),
      timestampData: JSON.stringify(timestampData)
    }
  );
};

export const sendAppClickEvent = (appName: string): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.landingPage,
    {
      field: appName + EVENT_CONSTANTS.field.appButtonClickName,
      aType: EVENT_CONSTANTS.aType.click
    }
  );
};

export const incrementSignUpSubmitCounters = (isFirstSignUpSubmit: boolean): void => {
  incrementEphemeralCounter(counters.attempt);

  if (isFirstSignUpSubmit) {
    incrementEphemeralCounter(counters.firstAttempt);
  }
};

type TSignupFormInteractionEventInput = {
  field: string;
  aType: string;
};

const sendSignupFormInteractionEvent = (param: TSignupFormInteractionEventInput) => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.signupForm,
    {
      field: param.field,
      aType: param.aType
    }
  );
};

export const sendDayFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayDay,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendDayOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayDay,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendMonthFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayMonth,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendMonthOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayMonth,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendYearFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayYear,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendYearOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayYear,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendUsernameFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupUsername,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendUsernameOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupUsername,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendPasswordFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupPassword,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendPasswordOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupPassword,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendMaleGenderFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderMale,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendMaleGenderOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderMale,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendFemaleGenderFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderFemale,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendFemaleGenderOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderFemale,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

const sendKoreaEmailFocusEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.signupForm,
    {
      origin: EVENT_CONSTANTS.origin.webVerifiedSignup,
      field: EVENT_CONSTANTS.field.parentEmail
    }
  );
};

export const sendEmailFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupEmail,
    aType: EVENT_CONSTANTS.aType.focus
  });
  // the angular implmentation sends two events for email focus, one from the directive for the email field
  // and another to indicate that it comes from the korea id verification flow
  sendKoreaEmailFocusEvent();
};

export const sendEmailOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupEmail,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendShowPasswordButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.buttonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      field: EVENT_CONSTANTS.field.showPassword
    }
  );
};

export const sendHidePasswordButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.buttonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      field: EVENT_CONSTANTS.field.hidePassword
    }
  );
};

export const sendUsernameSuggestionShownEvent = (state: string, suggestions: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.usernameSuggestionShown,
    EVENT_CONSTANTS.context.signupForm,
    {
      state,
      suggestions
    }
  );
};

export const sendUsernameValidationErrorEvent = (input: string, message: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input,
      msg: message,
      field: EVENT_CONSTANTS.field.signupUsername
    }
  );
};

export const sendUsernameValidationSuccessEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.signupForm,
    {
      field: EVENT_CONSTANTS.field.usernameValid
    }
  );
};

export const sendPasswordValidationEvent = (message: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input: EVENT_CONSTANTS.input.redacted,
      msg: message,
      field: EVENT_CONSTANTS.field.signupUsername
    }
  );
};

export const sendEmailValidationEvent = (input: string, message: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input,
      msg: message,
      field: EVENT_CONSTANTS.field.signupEmail
    }
  );
};

export const sendTosCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.buttonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.termsOfServiceCheckbox,
      field: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked,
      origin: EVENT_CONSTANTS.origin.signup
    }
  );
};

export const sendPrivacyPolicyboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.buttonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.privacyPolicyCheckbox,
      field: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked,
      origin: EVENT_CONSTANTS.origin.signup
    }
  );
};

export const sendVPCSignupPageLoadEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authPageLoad,
    context.finishParentalSignup,
    {
      state: `sessionId: ${sessionId || 'unknown'}`,
      associatedText: EVENT_CONSTANTS.text.finishCreatingYourAccount
    }
  );
};

export const sendVPCSignupBirthdateFieldInteractedEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string
): void => {
  const context = getVPCEventContext(requestType);

  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authFormInteraction,
    context.finishParentalSignup,
    {
      state: `sessionId: ${sessionId || 'unknown'}`,
      field: EVENT_CONSTANTS.field.birthday
    }
  );
};

export const sendVPCSignupButtonClickedEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    context.finishParentalSignup,
    {
      state: `sessionId: ${sessionId || 'unknown'}`,
      btn: EVENT_CONSTANTS.btn.signup,
      associatedText: EVENT_CONSTANTS.text.createAccount
    }
  );
};

export const sendShowVPCLogoutPopupEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authModalShown,
    context.homepage,
    {
      field: EVENT_CONSTANTS.field.logoutPopup,
      state: `sessionId: ${sessionId || 'unknown'}`,
      associatedText: EVENT_CONSTANTS.text.logout
    }
  );
};

export const sendClickVPCLogoutPopupLogoutEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    context.homepage,
    {
      state: `sessionId: ${sessionId || 'unknown'}`,
      btn: EVENT_CONSTANTS.btn.logoutPopupLogout,
      associatedText: EVENT_CONSTANTS.text.logout
    }
  );
};
/**
 * Log event for when the user logs out of all currently logged-in accounts. Most likely due to logging into an underage account.
 */
export const sendLogoutAllAccountsOnSignupEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.logoutAll,
      origin: EVENT_CONSTANTS.origin.signup
    }
  );
};

export const sendAuthButtonClickEvent = (btn: string, state: string, ctx: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    ctx,
    {
      btn,
      state
    }
  );
};

export const sendKoreaConsentAllCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaConsentAllCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaTosAndPrivacyPolicyCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaTosAndPrivacyPolicyCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaThirdPartyPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaThirdPartyPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaTransferPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaTransferPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaOptionalPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaOptionalPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaAgreeTermsOfServiceButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaAgreeTermsOfService
    }
  );
};

export default {
  incrementEphemeralCounter,
  sendConversionEvent,
  sendSignupButtonClickEvent,
  sendAppClickEvent,
  incrementSignUpSubmitCounters,
  sendVPCSignupPageLoadEvent,
  sendVPCSignupBirthdateFieldInteractedEvent,
  sendVPCSignupButtonClickedEvent
};
