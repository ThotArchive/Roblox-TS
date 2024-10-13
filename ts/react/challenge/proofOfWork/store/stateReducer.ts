import { ProofOfWorkAction, ProofOfWorkActionType } from './action';
import { ProofOfWorkState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const proofOfWorkStateReducer = (
  oldState: ProofOfWorkState,
  action: ProofOfWorkAction
): ProofOfWorkState => {
  const newState = { ...oldState };
  switch (action.type) {
    case ProofOfWorkActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case ProofOfWorkActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case ProofOfWorkActionType.SET_CHALLENGE_ABANDONED:
      newState.isAbandoned = true;
      return newState;
    case ProofOfWorkActionType.SET_CHALLENGE_TIMEOUT:
      newState.isTimeout = true;
      return newState;
    case ProofOfWorkActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case ProofOfWorkActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default proofOfWorkStateReducer;
