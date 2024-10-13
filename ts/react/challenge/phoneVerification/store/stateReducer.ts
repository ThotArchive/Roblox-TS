import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { PhoneVerificationAction, PhoneVerificationActionType } from './action';
import { PhoneVerificationState } from './state';

const phoneVerificationStateReducer = (
  oldState: PhoneVerificationState,
  action: PhoneVerificationAction
): PhoneVerificationState => {
  const newState = { ...oldState };
  switch (action.type) {
    case PhoneVerificationActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;
    case PhoneVerificationActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;
    case PhoneVerificationActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case PhoneVerificationActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default phoneVerificationStateReducer;
