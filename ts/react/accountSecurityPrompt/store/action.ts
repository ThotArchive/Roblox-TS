import ModalState from './modalState';

export enum AccountSecurityPromptActionType {
  DISMISS_TEMPORARY,
  DISMISS_FOREVER,
  SET_FLOW_COMPLETE,
  SET_MODAL_STATE,
  SET_EMAIL_ADDRESS,
  SET_ACCOUNT_PIN_UNLOCKED_UNTIL
}

export type AccountSecurityPromptAction =
  | {
      type: AccountSecurityPromptActionType.DISMISS_TEMPORARY;
    }
  | {
      type: AccountSecurityPromptActionType.DISMISS_FOREVER;
    }
  | {
      type: AccountSecurityPromptActionType.SET_MODAL_STATE;
      modalState: ModalState;
    }
  | {
      type: AccountSecurityPromptActionType.SET_EMAIL_ADDRESS;
      emailAddress: string;
    }
  | {
      type: AccountSecurityPromptActionType.SET_ACCOUNT_PIN_UNLOCKED_UNTIL;
      accountPinUnlockedUntil: number | null;
    };
