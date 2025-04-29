import { OnChallengeCompletedData, OnChallengeInvalidatedData } from '../interface';

export enum PrivateAccessTokenActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED
}

export type PrivateAccessTokenAction =
  | {
      type: PrivateAccessTokenActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: PrivateAccessTokenActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    };
