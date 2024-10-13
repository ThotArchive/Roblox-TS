import { eventStreamService } from 'core-roblox-utilities';
import emailRequestConstants from '../constants/emailRequestConstants';

const { events } = emailRequestConstants;

const emailVerificationEventService = {
  useAddEmailToAccountEvent: (origin: string): void => {
    const event = events.useAddEmailField;
    eventStreamService.sendEventWithTarget(event.type, event.context, {
      ...event.params,
      origin
    });
  },
  addEmailToAccountEvent: (origin: string): void => {
    const event = events.addEmailConfirm;
    eventStreamService.sendEventWithTarget(event.type, event.context, {
      ...event.params,
      origin
    });
  }
};

export default emailVerificationEventService;
