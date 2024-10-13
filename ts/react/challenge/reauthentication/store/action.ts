import { ErrorCode, OnChallengeCompletedData, ReauthenticationType } from '../interface';

export enum ReauthenticationActionType {
  SET_REAUTHENTICATION_TYPES,
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE,
  SET_CURRENT_REAUTHENTICATION_TYPE,
  INITIALIZE_EMAIL_OTP_SESSION
}

export type ReauthenticationAction =
  | {
      type: ReauthenticationActionType.SET_REAUTHENTICATION_TYPES;
      defaultType: ReauthenticationType;
      availableTypes: ReauthenticationType[];
    }
  | {
      type: ReauthenticationActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: ReauthenticationActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: ReauthenticationActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: ReauthenticationActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: ReauthenticationActionType.INITIALIZE_EMAIL_OTP_SESSION;
      sessionId: string | null;
    };
