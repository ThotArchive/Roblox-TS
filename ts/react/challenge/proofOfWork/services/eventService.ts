import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendPuzzleInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleInitialized,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendPuzzleCompletedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleCompleted,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeCompletedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeInvalidatedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeAbandonedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        sessionId: this.sessionId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeTimeoutEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeTimeout,
      {
        sessionId: this.sessionId
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
