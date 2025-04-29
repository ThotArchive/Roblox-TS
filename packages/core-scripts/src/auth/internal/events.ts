import { sendEventWithTarget } from "../../event-stream";
import { BatGenerationErrorInfo, SaiGenerationErrorInfo } from "./types";

const constants = {
  eventName: {
    batCreated: "batCreated",
    batMissing: "batMissing",
    saiCreated: "saiCreated",
    saiMissing: "saiMissing",
  },
  context: {
    hba: "hba",
  },
  sessionStorageState: {
    batSuccessEventSent: "batSuccessEventSent",
    batMissingEventSent: "batMissingEventSent",
  },
};

// Sampling constant.
const ONE_MILLION = 1_000_000;

export const sendBATSuccessEvent = (url: string, sampleRatePerMillion: number): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    sendEventWithTarget(constants.eventName.batCreated, constants.context.hba, {
      field: url,
    });
  }
};

export const sendBATMissingEvent = (
  url: string,
  errorInfo: BatGenerationErrorInfo,
  sampleRatePerMillion: number,
): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    sendEventWithTarget(constants.eventName.batMissing, constants.context.hba, {
      field: url,
      kind: errorInfo.kind,
      messageRaw: errorInfo.message,
    });
  }
};

export const sendSAISuccessEvent = (): void => {
  sendEventWithTarget(constants.eventName.saiCreated, constants.context.hba, {});
};

export const sendSAIMissingEvent = (errorInfo: SaiGenerationErrorInfo): void => {
  sendEventWithTarget(constants.eventName.saiMissing, constants.context.hba, {
    messageRaw: errorInfo.message,
  });
};
