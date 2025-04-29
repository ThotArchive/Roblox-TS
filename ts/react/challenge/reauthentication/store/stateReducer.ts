import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { ReauthenticationAction, ReauthenticationActionType } from './action';
import { ReauthenticationState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const reauthenticationStateReducer = (
  oldState: ReauthenticationState,
  action: ReauthenticationAction
): ReauthenticationState => {
  const newState = { ...oldState };
  switch (action.type) {
    case ReauthenticationActionType.SET_REAUTHENTICATION_TYPES:
      newState.defaultType = action.defaultType;
      newState.availableTypes = action.availableTypes;
      return newState;

    case ReauthenticationActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;

    case ReauthenticationActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;

    case ReauthenticationActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;

    case ReauthenticationActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;

    case ReauthenticationActionType.INITIALIZE_EMAIL_OTP_SESSION:
      newState.initialOtpSessionId = action.sessionId;
      return newState;

    default:
      return oldState;
  }
};

export default reauthenticationStateReducer;
