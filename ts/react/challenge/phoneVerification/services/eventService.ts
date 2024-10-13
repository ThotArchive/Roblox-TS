import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';

export class EventServiceDefault {
  private challengeId: string;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeCompletedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeInvalidatedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }
}

/**
 * An interface encapsulating the events fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * event service.
 */
export type EventService = {
  [K in keyof EventServiceDefault]: EventServiceDefault[K];
};
