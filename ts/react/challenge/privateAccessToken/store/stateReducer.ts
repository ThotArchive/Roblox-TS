import { PrivateAccessTokenAction, PrivateAccessTokenActionType } from './action';
import { PrivateAccessTokenState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const privateAccessTokenStateReducer = (
  oldState: PrivateAccessTokenState,
  action: PrivateAccessTokenAction
): PrivateAccessTokenState => {
  const newState = { ...oldState };
  switch (action.type) {
    case PrivateAccessTokenActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case PrivateAccessTokenActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    default:
      return oldState;
  }
};

export default privateAccessTokenStateReducer;
