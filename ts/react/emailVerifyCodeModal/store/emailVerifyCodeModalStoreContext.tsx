import React, { ReactChild, ReactElement, createContext, useReducer } from 'react';
import { pageNames } from '../constants/EmailVerifyCodeModalConstants';

export enum emailVerifyCodeModalActionType {
  SET_ENTER_EMAIL_PAGE,
  SET_ENTER_CODE_PAGE,
  SET_EMAIL,
  SET_SESSION_TOKEN,
  SET_OTP_CODE,
  SET_LEGAL_CHECK,
  SET_CODE_VALID,
  SET_LOADING,
  SET_CHECKBOX_AND_CONTINUE_BUTTON_STATE,
  SET_ERROR,
  CLOSE_MODAL
}

export type TEmailVerifyCodeModalState = {
  emailVerifyCodeModalPage: string;
  email: string;
  sessionToken: string;
  code: string;
  isChecked: boolean;
  isCheckboxEnabled: boolean;
  isLoading: boolean;
  isCodeValid: boolean;
  isContinueButtonEnabled: boolean;
  errorMessage: string;
  isModalOpen: boolean;
};

export type TEmailVerifyCodeModalAction =
  | {
      type: emailVerifyCodeModalActionType.SET_ENTER_EMAIL_PAGE;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_ENTER_CODE_PAGE;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_EMAIL;
      email: string;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_OTP_CODE;
      code: string;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_SESSION_TOKEN;
      sessionToken: string;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_LEGAL_CHECK;
      isChecked: boolean;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_CHECKBOX_AND_CONTINUE_BUTTON_STATE;
      isContinueButtonEnabled: boolean;
      isCheckboxEnabled: boolean;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_CODE_VALID;
      isCodeValid: boolean;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_LOADING;
      isLoading: boolean;
    }
  | {
      type: emailVerifyCodeModalActionType.SET_ERROR;
      errorMessage: string;
    }
  | {
      type: emailVerifyCodeModalActionType.CLOSE_MODAL;
    };

export type TEmailVerifyCodeModalContext = {
  state: TEmailVerifyCodeModalState;
  dispatch: React.Dispatch<TEmailVerifyCodeModalAction>;
};

const initialState: TEmailVerifyCodeModalState = {
  emailVerifyCodeModalPage: pageNames.EnterEmail,
  email: '',
  sessionToken: '',
  code: '',
  isChecked: false,
  isCheckboxEnabled: false,
  isLoading: false,
  isCodeValid: false,
  isContinueButtonEnabled: false,
  errorMessage: '',
  isModalOpen: true
};

export const emailVerifyCodeModalContext = createContext<TEmailVerifyCodeModalContext | null>(null);
// The argument passed to `createContext` is supposed to define a default
// value that gets used if no provider is available in the component tree at
// the time that `useContext` is called. To avoid runtime errors as a result
// of forgetting to wrap a subtree with a provider, we use `null` as the
// default value and test for it whenever global state is accessed.

export const emailVerifyCodeReducer = (
  oldState: TEmailVerifyCodeModalState,
  action: TEmailVerifyCodeModalAction
): TEmailVerifyCodeModalState => {
  const newState = { ...oldState };
  switch (action.type) {
    case emailVerifyCodeModalActionType.SET_ENTER_EMAIL_PAGE:
      newState.emailVerifyCodeModalPage = pageNames.EnterEmail;
      return newState;
    case emailVerifyCodeModalActionType.SET_ENTER_CODE_PAGE:
      newState.emailVerifyCodeModalPage = pageNames.EnterCode;
      return newState;
    case emailVerifyCodeModalActionType.SET_EMAIL:
      newState.email = action.email;
      return newState;
    case emailVerifyCodeModalActionType.SET_SESSION_TOKEN:
      newState.sessionToken = action.sessionToken;
      return newState;
    case emailVerifyCodeModalActionType.SET_OTP_CODE:
      newState.code = action.code;
      return newState;
    case emailVerifyCodeModalActionType.SET_LEGAL_CHECK:
      newState.isChecked = action.isChecked;
      return newState;
    case emailVerifyCodeModalActionType.SET_CODE_VALID:
      newState.isCodeValid = action.isCodeValid;
      return newState;
    case emailVerifyCodeModalActionType.SET_LOADING:
      newState.isLoading = action.isLoading;
      return newState;
    case emailVerifyCodeModalActionType.SET_CHECKBOX_AND_CONTINUE_BUTTON_STATE:
      newState.isContinueButtonEnabled = action.isContinueButtonEnabled;
      newState.isCheckboxEnabled = action.isCheckboxEnabled;
      return newState;
    case emailVerifyCodeModalActionType.SET_ERROR:
      newState.errorMessage = action.errorMessage;
      return newState;
    case emailVerifyCodeModalActionType.CLOSE_MODAL:
      newState.isModalOpen = false;
      return newState;
    default:
      return oldState;
  }
};

type Props = {
  children: ReactChild;
};

export const EmailVerifyCodeModalStateProvider = ({ children }: Props): ReactElement => {
  const [state, dispatch] = useReducer(emailVerifyCodeReducer, initialState);

  return (
    <emailVerifyCodeModalContext.Provider value={{ state, dispatch }}>
      {children}
    </emailVerifyCodeModalContext.Provider>
  );
};
