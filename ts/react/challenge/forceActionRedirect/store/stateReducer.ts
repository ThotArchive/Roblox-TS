import { ForceActionRedirectAction, ForceActionRedirectActionType } from './action';
import { ForceActionRedirectState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const forceActionStateReducer = (
  oldState: ForceActionRedirectState,
  action: ForceActionRedirectAction
): ForceActionRedirectState => {
  const newState = { ...oldState };
  switch (action.type) {
    case ForceActionRedirectActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;

    case ForceActionRedirectActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;

    default:
      return oldState;
  }
};

export default forceActionStateReducer;
