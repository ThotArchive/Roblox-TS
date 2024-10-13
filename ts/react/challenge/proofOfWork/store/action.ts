import { OnChallengeCompletedData, OnChallengeInvalidatedData } from '../interface';

export enum ProofOfWorkActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  SET_CHALLENGE_ABANDONED,
  SET_CHALLENGE_TIMEOUT,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type ProofOfWorkAction =
  | {
      type: ProofOfWorkActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: ProofOfWorkActionType.SET_CHALLENGE_ABANDONED;
    }
  | {
      type: ProofOfWorkActionType.SET_CHALLENGE_TIMEOUT;
    }
  | {
      type: ProofOfWorkActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: ProofOfWorkActionType.HIDE_MODAL_CHALLENGE;
    };
