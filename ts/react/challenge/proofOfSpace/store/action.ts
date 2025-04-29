import { OnChallengeCompletedData, OnChallengeInvalidatedData } from '../interface';

export enum ProofOfSpaceActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  SET_CHALLENGE_ABANDONED,
  SET_CHALLENGE_TIMEOUT,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type ProofOfSpaceAction =
  | {
      type: ProofOfSpaceActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: ProofOfSpaceActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: ProofOfSpaceActionType.SET_CHALLENGE_ABANDONED;
    }
  | {
      type: ProofOfSpaceActionType.SET_CHALLENGE_TIMEOUT;
      progress: number;
    }
  | {
      type: ProofOfSpaceActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: ProofOfSpaceActionType.HIDE_MODAL_CHALLENGE;
    };
