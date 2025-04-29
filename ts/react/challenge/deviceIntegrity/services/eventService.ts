import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';

export class EventServiceDefault {
  private challengeId: string;

  private integrityType: string;

  constructor(challengeId: string, integrityType: string) {
    this.challengeId = challengeId;
    this.integrityType = integrityType;
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeCompletedEvent(result: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType,
        result
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeInvalidatedEvent(result: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType,
        result
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
