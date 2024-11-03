/* eslint-disable import/prefer-default-export */
import { AccountSecurityPromptActionType } from '../store/action';
import { AccountSecurityPromptContext } from '../store/contextProvider';
import ModalState from '../store/modalState';

export const returnToIntro = (dispatch: AccountSecurityPromptContext['dispatch']) => (): void =>
  dispatch({
    type: AccountSecurityPromptActionType.SET_MODAL_STATE,
    modalState: ModalState.CHANGE_PASSWORD_INTRO
  });
