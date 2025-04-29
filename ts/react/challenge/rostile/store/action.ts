import { OnChallengeCompletedData, OnChallengeInvalidatedData } from '../interface';

export enum RostileActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  SET_CHALLENGE_ABANDONED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type RostileAction =
  | {
      type: RostileActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: RostileActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: RostileActionType.SET_CHALLENGE_ABANDONED;
    }
  | {
      type: RostileActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: RostileActionType.HIDE_MODAL_CHALLENGE;
    };
