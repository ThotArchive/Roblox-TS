import { AccountSecurityPromptAction, AccountSecurityPromptActionType } from './action';
import ModalState from './modalState';
import { AccountSecurityPromptState } from './state';

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `stateEffects.ts`, and the effects should be
// properly registered in `contextProvider.tsx`.
const accountSecurityPromptStateReducer = (
  oldState: AccountSecurityPromptState,
  action: AccountSecurityPromptAction
): AccountSecurityPromptState => {
  const newState = { ...oldState };
  switch (action.type) {
    case AccountSecurityPromptActionType.DISMISS_TEMPORARY:
      newState.isFlowComplete = true;
      return newState;

    case AccountSecurityPromptActionType.DISMISS_FOREVER:
      newState.isFlowComplete = true;
      return newState;

    case AccountSecurityPromptActionType.SET_MODAL_STATE:
      // Save the old modal state for transition-related effects.
      newState.lastModalState = oldState.modalState;

      // Save the new modal state as the current state.
      newState.modalState = action.modalState;

      // Handle various updates related to the new modal state.
      if (newState.modalState === ModalState.CHANGE_PASSWORD_CONFIRMATION) {
        newState.isFlowComplete = true;
      }
      return newState;

    case AccountSecurityPromptActionType.SET_EMAIL_ADDRESS:
      newState.emailAddress = action.emailAddress;
      return newState;

    default:
      return oldState;
  }
};

export default accountSecurityPromptStateReducer;
