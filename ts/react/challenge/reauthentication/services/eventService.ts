import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';
import { ReauthenticationType } from '../interface';

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private defaultType: string;

  constructor(defaultType: string) {
    this.defaultType = defaultType;
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        defaultType: this.defaultType
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendNoEnabledMethodsReturnedEvent(
    primaryReauthenticationType: ReauthenticationType | null,
    methodsReturned: number
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.noEnabledMethodsReturned,
      {
        defaultType: this.defaultType,
        primaryReauthenticationType: primaryReauthenticationType || 'unknown',
        methodsReturned
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeInvalidatedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeAbandonedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendChallengeCompletedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendOtpResendRequestedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.otpResendRequested,
      {
        defaultType: this.defaultType
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendReauthenticationTypeChangedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.reauthenticationTypeChanged,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  // This is currently trivially always ReauthenticationType.OTP_EMAIL, but may change if
  // OTP supports other mediums (eg. SMS).
  sendCodeSubmittedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeSubmitted,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCodeVerificationFailedEvent(
    reauthenticationType: ReauthenticationType | null,
    reason: string
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerificationFailed,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown',
        reason
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCodeVerifiedEvent(reauthenticationType: ReauthenticationType | null): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerified,
      {
        defaultType: this.defaultType,
        reauthenticationType: reauthenticationType || 'unknown'
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
