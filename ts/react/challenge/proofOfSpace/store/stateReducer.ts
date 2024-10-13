import { ProofOfSpaceAction, ProofOfSpaceActionType } from './action';
import { ProofOfSpaceState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const proofOfSpaceStateReducer = (
  oldState: ProofOfSpaceState,
  action: ProofOfSpaceAction
): ProofOfSpaceState => {
  const newState = { ...oldState };
  switch (action.type) {
    case ProofOfSpaceActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case ProofOfSpaceActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case ProofOfSpaceActionType.SET_CHALLENGE_ABANDONED:
      newState.isAbandoned = true;
      return newState;
    case ProofOfSpaceActionType.SET_CHALLENGE_TIMEOUT:
      newState.progressWhenTimedOut = action.progress;
      return newState;
    case ProofOfSpaceActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case ProofOfSpaceActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default proofOfSpaceStateReducer;
