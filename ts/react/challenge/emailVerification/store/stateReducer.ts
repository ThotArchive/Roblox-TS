import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { EmailVerificationAction, EmailVerificationActionType } from './action';
import { EmailVerificationState } from './state';

const emailVerificationStateReducer = (
  oldState: EmailVerificationState,
  action: EmailVerificationAction
): EmailVerificationState => {
  const newState = { ...oldState };
  switch (action.type) {
    case EmailVerificationActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;
    case EmailVerificationActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;
    case EmailVerificationActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case EmailVerificationActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default emailVerificationStateReducer;
