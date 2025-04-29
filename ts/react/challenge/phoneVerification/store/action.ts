import { ErrorCode, OnChallengeCompletedData } from '../interface';

export enum PhoneVerificationActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type PhoneVerificationAction =
  | {
      type: PhoneVerificationActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: PhoneVerificationActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: PhoneVerificationActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: PhoneVerificationActionType.SHOW_MODAL_CHALLENGE;
    };
