/**
 * Constants for event stream events in navigation webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authButtonClick: 'authButtonClick',
    authPageLoad: 'authPageLoad'
  },
  context: {
    homepage: 'homepage',
    accountSwitcherStatus: 'accountSwitcherStatus'
  },
  btn: {
    logout: 'logout',
    switchAccount: 'switchAccount'
  }
} as const;

export default EVENT_CONSTANTS;
