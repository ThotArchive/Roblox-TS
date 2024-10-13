import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

const { eventTypes } = eventStreamService;

type AuthFormInteractionEventParams = {
  ctx: string;
  field: string;
  origin?: string;
  entered?: string;
  state?: string;
};

type TOtpFormInteractionEventParams = {
  ctx: string;
  field: string;
  btn?: string;
  aType?: string;
  errorCode?: string;
  origin?: string;
};

const sendOtpAuthFormInteractionEvent = ({
  ctx,
  field,
  origin,
  entered,
  state
}: AuthFormInteractionEventParams): void => {
  const additionalProperties: Record<string, string> = {};
  additionalProperties.field = field;
  if (entered) {
    additionalProperties.entered = entered;
  }
  if (state) {
    additionalProperties.state = state;
  }
  if (origin) {
    additionalProperties.origin = origin;
  }
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction,
    ctx,
    additionalProperties
  );
};

const getSchematizedContext = (ctx: string): string => {
  // There are some minor casing switches for contexts in schematized event spec, so address them here.
  // Additionally, validateOTP is replaced by enterOtp.
  const contextMap: { [key: string]: string } = {
    [EVENT_CONSTANTS.context.validateOTP]: EVENT_CONSTANTS.context.schematizedEnterOTP,
    [EVENT_CONSTANTS.context.enterOTP]: EVENT_CONSTANTS.context.schematizedEnterOTP,
    [EVENT_CONSTANTS.context.sendOTP]: EVENT_CONSTANTS.context.schematizedSendOTP
  };

  return contextMap[ctx] || ctx;
};

const sendOtpFormInteractionEvent = ({
  ctx,
  field,
  btn,
  aType,
  errorCode,
  origin
}: TOtpFormInteractionEventParams): void => {
  const additionalProperties: Record<string, string> = {};
  additionalProperties.field = field;
  if (btn) {
    additionalProperties.btn = btn;
  }
  if (aType) {
    additionalProperties.aType = aType;
  }
  if (errorCode) {
    additionalProperties.errorCode = errorCode;
  }
  if (origin) {
    additionalProperties.origin = origin;
  }
  eventStreamService.sendEventWithTarget(eventTypes.formInteraction, ctx, additionalProperties);
};

export const sendEmailInputEvent = (origin: string): void => {
  sendOtpFormInteractionEvent({
    ctx: EVENT_CONSTANTS.context.sendOTP,
    field: EVENT_CONSTANTS.field.email,
    origin
  });
  sendOtpAuthFormInteractionEvent({
    ctx: EVENT_CONSTANTS.context.schematizedSendOTP,
    field: EVENT_CONSTANTS.field.email,
    origin
  });
};

export const sendCodeInputEvent = (origin: string): void => {
  sendOtpFormInteractionEvent({
    ctx: EVENT_CONSTANTS.context.enterOTP,
    field: EVENT_CONSTANTS.field.otpCode,
    origin
  });
  sendOtpAuthFormInteractionEvent({
    ctx: EVENT_CONSTANTS.context.schematizedEnterOTP,
    field: EVENT_CONSTANTS.field.code,
    origin
  });
};

export const sendErrorEvent = (ctx: string, errorCode: string, origin: string): void => {
  sendOtpFormInteractionEvent({
    ctx,
    field: EVENT_CONSTANTS.field.errorMessage,
    aType: EVENT_CONSTANTS.aType.shown,
    errorCode,
    origin
  });

  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
    getSchematizedContext(ctx),
    {
      // TODO: @wlu update event logs to reflect fixed schematized spreadsheets; this is not intended to be true
      field:
        ctx === EVENT_CONSTANTS.context.enterOTP
          ? EVENT_CONSTANTS.field.resendErrorMessage
          : EVENT_CONSTANTS.field.errorMessage,
      errorCode,
      origin
    }
  );
};

export const sendOtpButtonClickEvent = (ctx: string, btn: string, origin: string): void => {
  eventStreamService.sendEventWithTarget(eventTypes.buttonClick, ctx, {
    btn,
    origin
  });
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    getSchematizedContext(ctx),
    {
      btn,
      origin
    }
  );
};

export const sendOtpCheckboxEvent = (
  ctx: string,
  btn: string,
  isChecked: boolean,
  origin: string
): void => {
  eventStreamService.sendEventWithTarget(eventTypes.buttonClick, ctx, {
    btn,
    field: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked,
    origin
  });
};

export const sendOtpModalActionEvent = (ctx: string, aType: string, origin: string): void => {
  eventStreamService.sendEventWithTarget(eventTypes.modalAction, ctx, {
    aType,
    origin
  });
};

export const sendOtpAuthPageLoadEvent = (ctx: string, origin: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    getSchematizedContext(ctx),
    {
      origin
    }
  );
};
