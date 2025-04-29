import { ErrorCode, OnChallengeCompletedData } from '../interface';

export enum CaptchaReducerActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type CaptchaReducerAction =
  | {
      type: CaptchaReducerActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: CaptchaReducerActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: CaptchaReducerActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE;
    };
