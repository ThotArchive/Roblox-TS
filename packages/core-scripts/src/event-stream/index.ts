import "../global";
import "./eventStream";
import { DEFAULT_TARGET_TYPES, EVENT_TYPES } from "../realtime/constants/events";

export const eventTypes = EVENT_TYPES;

type TargetTypes = {
  DEFAULT: number;
  WWW: number;
  STUDIO: number;
  DIAGNOSTIC: number;
};

export const targetTypes: TargetTypes = {
  ...DEFAULT_TARGET_TYPES,
  ...(window.Roblox.EventStream != null
    ? // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      (window.Roblox.EventStream.TargetTypes as typeof DEFAULT_TARGET_TYPES)
    : {}),
};

export const sendEventWithTarget = (
  eventName: string,
  context: string,
  additionalProperties: Record<string, string | number | undefined>,
  targetType?: number,
): void => {
  const { EventStream } = window.Roblox;
  if (EventStream?.SendEventWithTarget != null) {
    const validatedTargetType =
      targetType != null && Object.values(targetTypes).includes(targetType)
        ? targetType
        : targetTypes.WWW;

    EventStream.SendEventWithTarget(eventName, context, additionalProperties, validatedTargetType);
  }
};

export type Event = {
  name: string;
  type: string;
  context: string;
  requiredParams?: string[];
};

export const sendEvent = (
  event: Event,
  additionalParams: Record<string, string | number>,
): void => {
  const { name, type, context, requiredParams } = event;
  const eventParams = {
    btn: name,
    ...additionalParams,
  };

  if (Array.isArray(requiredParams)) {
    requiredParams.forEach(requiredParam => {
      if (!Object.prototype.hasOwnProperty.call(eventParams, requiredParam)) {
        // eslint-disable-next-line no-console
        console.info(`A required event parameter '${requiredParam}' is not provided`);
      }
    });
  }

  sendEventWithTarget(type, context, eventParams);
};

export const sendGamePlayEvent = (
  context: string,
  placeId: string,
  referrerId: string,
  joinAttemptId: string,
): void => {
  // @ts-expect-error TODO: add types or dummy import
  const { GamePlayEvents } = window.Roblox;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (GamePlayEvents?.SendGamePlayIntent) {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    GamePlayEvents.SendGamePlayIntent(context, placeId, referrerId, joinAttemptId);
  }
};
