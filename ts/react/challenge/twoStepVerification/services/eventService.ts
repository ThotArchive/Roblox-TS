import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';
import { MediaType } from '../interface';

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private challengeId: string;

  private targetUserId: string;

  constructor(challengeId: string, targetUserId: string) {
    this.challengeId = challengeId;
    this.targetUserId = targetUserId;
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendUserConfigurationLoadedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.userConfigurationLoaded,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendNoEnabledMethodsReturnedEvent(
    primaryMediaType: MediaType | null,
    methodsReturned: number
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.noEnabledMethodsReturned,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        primaryMediaType: primaryMediaType || '',
        methodsReturned
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeInvalidatedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeAbandonedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendEmailResendRequestedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.emailResendRequested,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendSmsResendRequestedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.smsResendRequested,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendMediaTypeChangedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.mediaTypeChanged,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCodeSubmittedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeSubmitted,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCodeVerificationFailedEvent(mediaType: MediaType | null, reason: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerificationFailed,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || '',
        reason
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCodeVerifiedEvent(mediaType: MediaType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerified,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || ''
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
