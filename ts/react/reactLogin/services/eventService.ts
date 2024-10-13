import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { CredentialType } from '../../common/types/loginTypes';

const { eventTypes } = eventStreamService;

// Send cross device login button click event
export const sendXdlButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.loginPage,
    {
      field: EVENT_CONSTANTS.field.loginOtherDevice,
      aType: EVENT_CONSTANTS.aType.click
    }
  );
};

export const sendLoginButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.loginPage,
    {
      field: EVENT_CONSTANTS.field.loginSubmitButtonName,
      aType: EVENT_CONSTANTS.aType.click
    }
  );
};

export const sendOtpLoginButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.loginPage,
    {
      field: EVENT_CONSTANTS.field.loginOTP,
      aType: EVENT_CONSTANTS.aType.click
    }
  );
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      btn: EVENT_CONSTANTS.field.OTP
    }
  );
};

export const sendOtpLoginErrorEvent = (errorCode: string): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.enterOTP,
    {
      field: EVENT_CONSTANTS.field.errorMessage,
      aType: EVENT_CONSTANTS.aType.shown,
      btn: EVENT_CONSTANTS.btn.login,
      errorCode
    }
  );
};

type TLoginFormInteractionEventInput = {
  field: string;
  aType: string;
};

const sendLoginFormInteractionEvent = (param: TLoginFormInteractionEventInput) => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.loginForm,
    {
      field: param.field,
      aType: param.aType
    }
  );
};

export const sendUsernameFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.username,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendUsernameOffFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.username,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendPasswordFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.password,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendPasswordOffFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.password,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendAccountSelectorLoadEvent = (
  numUsers: number,
  userIDsCsv: string,
  credentialType: CredentialType
): void => {
  // TODO: account selection events for other credential types
  if (credentialType === CredentialType.EmailOtpSessionToken) {
    eventStreamService.sendEventWithTarget(
      eventTypes.pageLoad,
      EVENT_CONSTANTS.context.disambiguationOTP,
      {
        numUsers: String(numUsers)
      }
    );
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
      EVENT_CONSTANTS.context.disambigOTP,
      {
        state: userIDsCsv
      }
    );
  }
};

export const sendAccountSelectionEvent = (
  credentialType: CredentialType,
  accountSelectionUserId: number
): void => {
  // TODO: account selection events for other credential types
  if (credentialType === CredentialType.EmailOtpSessionToken) {
    eventStreamService.sendEventWithTarget(
      eventTypes.formInteraction,
      EVENT_CONSTANTS.context.disambiguationOTP,
      {
        field: EVENT_CONSTANTS.field.accountSelection
      }
    );
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EVENT_CONSTANTS.context.disambigOTP,
      {
        btn: EVENT_CONSTANTS.btn.select,
        state: String(accountSelectionUserId)
      }
    );
  } else {
    eventStreamService.sendEventWithTarget(eventTypes.formInteraction, '', {
      field: EVENT_CONSTANTS.field.accountSelection
    });
  }
};

/**
 * If account switcher is enabled and user is on login page, send an event to record available accounts for switching.
 * @param userIdsCsv Comma separated list of user IDs
 */
export const sendAvailableAccountsForSwitchingOnPageLoadEvent = (userIdsCsv: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.accountSwitcherLogin,
    {
      state: userIdsCsv,
      field: EVENT_CONSTANTS.field.accountSwitcher
    }
  );
};

/*
 * Log event for when the user logs out of all currently logged-in accounts. Most likely due to logging into an underage account.
 */
export const sendLogoutAllAccountsOnLoginEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.loginPage,
    {
      btn: EVENT_CONSTANTS.btn.logoutAll,
      origin: EVENT_CONSTANTS.origin.login
    }
  );
};

export const sendPasskeyLoginPageLoadEvent = (supported: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.passkeyLogin,
    {
      state: String(supported)
    }
  );
};
