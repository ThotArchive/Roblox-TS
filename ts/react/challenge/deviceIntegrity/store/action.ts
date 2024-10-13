import { OnChallengeCompletedData, OnChallengeInvalidatedData } from '../interface';

export enum DeviceIntegrityActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED
}

export type DeviceIntegrityAction =
  | {
      type: DeviceIntegrityActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: DeviceIntegrityActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    };
