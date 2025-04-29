import { mapChallengeErrorCodeToResource } from '../constants/resources';
import { SecurityQuestionsAction, SecurityQuestionsActionType } from './action';
import { SecurityQuestionsState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const securityQuestionsStateReducer = (
  oldState: SecurityQuestionsState,
  action: SecurityQuestionsAction
): SecurityQuestionsState => {
  const newState = { ...oldState };
  switch (action.type) {
    case SecurityQuestionsActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      newState.isModalVisible = false;
      return newState;

    case SecurityQuestionsActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = {
        errorCode: action.errorCode,
        errorMessage: mapChallengeErrorCodeToResource(oldState.resources, action.errorCode)
      };
      newState.isModalVisible = false;
      return newState;

    case SecurityQuestionsActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;

    case SecurityQuestionsActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;

    default:
      return oldState;
  }
};

export default securityQuestionsStateReducer;
