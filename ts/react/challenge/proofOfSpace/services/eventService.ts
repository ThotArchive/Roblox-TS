import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private readonly challengeId: string;

  private startTime: number | null;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
    this.startTime = null;
  }

  sendChallengeInitializedEvent(): void {
    this.startTime = Date.now();
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendPuzzleInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleInitialized,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendPuzzleCompletedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleCompleted,
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

  sendChallengeAbandonedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        challengeId: this.challengeId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeTimeoutEvent(progress: number): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeTimeout,
      {
        challengeId: this.challengeId,
        timeoutProgress: progress,
        timeoutElapsedTime: this.startTime !== null ? Date.now() - this.startTime : 0
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
