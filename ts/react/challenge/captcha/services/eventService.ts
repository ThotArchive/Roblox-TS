import Roblox from 'Roblox';
import { EVENT_CONSTANTS } from '../app.config';
import { ActionType } from '../interface';

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  sendCaptchaRedeemEvent(
    actionType: ActionType,
    solveDuration: number,
    isSuccessful: boolean,
    sessionToken: string,
    unifiedCaptchaId: string,
    providerVersion: string
  ): void {
    const success = isSuccessful ? 'true' : 'false';
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName.captcha,
      actionType,
      {
        solveDuration,
        success,
        provider: this.provider,
        session: sessionToken || '',
        ucid: unifiedCaptchaId || '',
        providerVersion
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCaptchaInitiatedEvent(
    actionType: ActionType,
    captchaInitiatedChallengeType: string,
    sessionToken: string | null,
    unifiedCaptchaId: string,
    errorMessage: string | null,
    providerVersion: string
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName.captchaInitiated,
      actionType,
      {
        type: captchaInitiatedChallengeType,
        provider: this.provider,
        ucid: unifiedCaptchaId || '',
        session: sessionToken || '',
        message: errorMessage || '',
        providerVersion
      },
      Roblox.EventStream.TargetTypes.WWW
    );
  }

  sendCaptchaV2ExperimentationEvent(
    actionType: ActionType,
    unifiedCaptchaId: string,
    browserTrackerId: string,
    captchaVersion: string
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName.captchaV2Experimentation,
      actionType,
      {
        btid: browserTrackerId,
        provider: this.provider,
        ucid: unifiedCaptchaId || '',
        captchaVersion
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
