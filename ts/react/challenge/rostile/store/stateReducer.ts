import { RostileAction, RostileActionType } from './action';
import { RostileState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const rostileStateReducer = (oldState: RostileState, action: RostileAction): RostileState => {
  const newState = { ...oldState };
  switch (action.type) {
    case RostileActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case RostileActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case RostileActionType.SET_CHALLENGE_ABANDONED:
      newState.isAbandoned = true;
      return newState;
    case RostileActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case RostileActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default rostileStateReducer;
