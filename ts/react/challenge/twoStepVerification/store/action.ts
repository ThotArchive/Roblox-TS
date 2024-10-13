import {
  GetMetadataReturnType,
  GetUserConfigurationReturnType
} from '../../../../common/request/types/twoStepVerification';
import { ErrorCode, MediaType, OnChallengeCompletedData } from '../interface';

export enum TwoStepVerificationActionType {
  SET_METADATA,
  SET_USER_CONFIGURATION,
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type TwoStepVerificationAction =
  | {
      type: TwoStepVerificationActionType.SET_METADATA;
      metadata: GetMetadataReturnType;
    }
  | {
      type: TwoStepVerificationActionType.SET_USER_CONFIGURATION;
      userConfiguration: GetUserConfigurationReturnType;
      enabledMediaTypes: MediaType[];
    }
  | {
      type: TwoStepVerificationActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED;
      errorCode: ErrorCode;
    }
  | {
      type: TwoStepVerificationActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: TwoStepVerificationActionType.SHOW_MODAL_CHALLENGE;
    };
