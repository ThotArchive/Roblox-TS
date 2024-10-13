import { eventStreamService } from 'core-roblox-utilities';

export const sendVerificationUpsellEvent = (event, params) => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params,
    origin: params.origin,
    section: params.section
  });
};

export const getErrorEventWithErrorCodeParam = (error, code) => {
  const err = { ...error };
  err.params = { ...err.params, errorCode: code };
  return err;
};
