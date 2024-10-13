import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { CaptchaReducerAction, CaptchaReducerActionType } from './action';
import { CaptchaState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const captchaStateReducer = (
  oldState: CaptchaState,
  action: CaptchaReducerAction
): CaptchaState => {
  const newState = { ...oldState };
  switch (action.type) {
    case CaptchaReducerActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;

    case CaptchaReducerActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;

    case CaptchaReducerActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;

    case CaptchaReducerActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;

    default:
      return oldState;
  }
};

export default captchaStateReducer;
