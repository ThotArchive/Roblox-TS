import { ErrorCode, OnChallengeCompletedData } from '../interface';

export enum EmailVerificationActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type EmailVerificationAction =
  | {
      type: EmailVerificationActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: EmailVerificationActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: EmailVerificationActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: EmailVerificationActionType.SHOW_MODAL_CHALLENGE;
    };
