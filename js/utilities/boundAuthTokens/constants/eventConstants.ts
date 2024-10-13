/**
 * Constants for event stream events in auth webapp.
 */
const EVENT_CONSTANTS = {
  eventName: {
    batCreated: 'batCreated',
    batMissing: 'batMissing',
    saiCreated: 'saiCreated',
    saiMissing: 'saiMissing'
  },
  context: {
    hba: 'hba'
  },
  sessionStorageState: {
    batSuccessEventSent: 'batSuccessEventSent',
    batMissingEventSent: 'batMissingEventSent'
  }
} as const;

export default EVENT_CONSTANTS;
