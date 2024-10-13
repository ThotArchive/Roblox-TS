import eventStreamService from '../../../core/services/eventStreamService/eventStreamService';
import EVENT_CONSTANTS from '../constants/eventConstants';
import { BatGenerationErrorInfo, SaiGenerationErrorInfo } from '../types/hbaTypes';

// Sampling constant.
const ONE_MILLION = 1_000_000;

export const sendBATSuccessEvent = (url: string, sampleRatePerMillion: number): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventName.batCreated,
      EVENT_CONSTANTS.context.hba,
      {
        field: url
      }
    );
  }
};

export const sendBATMissingEvent = (
  url: string,
  errorInfo: BatGenerationErrorInfo,
  sampleRatePerMillion: number
): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventName.batMissing,
      EVENT_CONSTANTS.context.hba,
      {
        field: url,
        kind: errorInfo.kind,
        messageRaw: errorInfo.message
      }
    );
  }
};

export const sendSAISuccessEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiCreated,
    EVENT_CONSTANTS.context.hba,
    {}
  );
};

export const sendSAIMissingEvent = (errorInfo: SaiGenerationErrorInfo): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiMissing,
    EVENT_CONSTANTS.context.hba,
    {
      messageRaw: errorInfo.message
    }
  );
};

export default {
  sendBATSuccessEvent,
  sendBATMissingEvent,
  sendSAISuccessEvent,
  sendSAIMissingEvent
};
