import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { TwoStepVerificationAction, TwoStepVerificationActionType } from './action';
import { TwoStepVerificationState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const twoStepVerificationStateReducer = (
  oldState: TwoStepVerificationState,
  action: TwoStepVerificationAction
): TwoStepVerificationState => {
  const newState = { ...oldState };
  switch (action.type) {
    case TwoStepVerificationActionType.SET_METADATA:
      newState.metadata = action.metadata;
      return newState;

    case TwoStepVerificationActionType.SET_USER_CONFIGURATION:
      newState.userConfiguration = action.userConfiguration;
      newState.enabledMediaTypes = action.enabledMediaTypes;
      return newState;

    case TwoStepVerificationActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;

    case TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;

    case TwoStepVerificationActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;

    case TwoStepVerificationActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;

    default:
      return oldState;
  }
};

export default twoStepVerificationStateReducer;
