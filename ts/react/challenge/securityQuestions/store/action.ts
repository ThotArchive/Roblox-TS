import { ErrorCode, OnChallengeCompletedData } from '../interface';

export enum SecurityQuestionsActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type SecurityQuestionsAction =
  | {
      type: SecurityQuestionsActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: SecurityQuestionsActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: SecurityQuestionsActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: SecurityQuestionsActionType.SHOW_MODAL_CHALLENGE;
    };
