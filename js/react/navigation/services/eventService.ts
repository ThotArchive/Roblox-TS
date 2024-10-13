import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../constants/eventsConstants';

/**
 * Log event for logout button click
 */
export const sendLogoutButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.logout
    }
  );
};

/**
 * Log event for switchAccount entrypoint button click
 */
export const sendSwitchAccountButtonClickEvent = (url: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.switchAccount,
      state: url.toString()
    }
  );
};

/**
 * Log whether account switcher blob is present or not. Should be logged on page load.
 * @param boolean isBlobPresent
 */
export const sendAccountSwitcherBlobPresentOnPageLoadEvent = (isBlobPresent: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.accountSwitcherStatus,
    {
      state: isBlobPresent.toString()
    }
  );
};
