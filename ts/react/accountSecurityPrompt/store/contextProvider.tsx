import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useReducer,
  useState
} from 'react';
import { TranslateFunction } from 'react-utilities';
import { RequestService } from '../../../common/request';
import { PromptAssignment, PromptType } from '../../../common/request/types/promptAssignments';
import { getPersonalizedResources } from '../constants/resources';
import { EventService } from '../services/eventService';
import { AccountSecurityPromptAction } from './action';
import ModalState from './modalState';
import { AccountSecurityPromptState } from './state';
import { runModalStateChangeEffect } from './stateEffects';
import accountSecurityPromptStateReducer from './stateReducer';

export type AccountSecurityPromptContext = {
  state: AccountSecurityPromptState;
  dispatch: React.Dispatch<AccountSecurityPromptAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `accountSecurityPrompt` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const AccountSecurityPromptContext = createContext<AccountSecurityPromptContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null
);

type Props = {
  promptAssignment: PromptAssignment;
  username: string;
  isUserUnder13: boolean;
  eventService: EventService;
  requestService: RequestService;
  translate: TranslateFunction;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const AccountSecurityPromptContextProvider = ({
  promptAssignment,
  username,
  isUserUnder13,
  eventService,
  requestService,
  translate,
  children
}: Props): ReactElement => {
  let modalState = ModalState.NONE;
  // If the broader authenticator upsell has showBanner as false, go directly to the modal.
  const shouldGoDirectlyToAuthenticatorUpsell =
    promptAssignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL &&
    promptAssignment.isGeneric !== true &&
    !promptAssignment.metadata.showBanner;

  const shouldGoDirectlyToEmail2SVUpsell =
    promptAssignment.promptType === PromptType.EMAIL_2SV_UPSELL &&
    promptAssignment.isGeneric !== true &&
    !promptAssignment.metadata.showBanner;

  if (
    promptAssignment.promptType === PromptType.AUTHENTICATOR_UPSELL ||
    shouldGoDirectlyToAuthenticatorUpsell
  ) {
    modalState = ModalState.AUTHENTICATOR_UPSELL_OPENING;
  } else if (promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPSELL) {
    modalState = ModalState.ACCOUNT_RESTORE_POLICY_UPSELL;
  } else if (
    promptAssignment.promptType === PromptType.EMAIL_2SV_UPSELL &&
    shouldGoDirectlyToEmail2SVUpsell
  ) {
    modalState = ModalState.EMAIL_2SV_UPSELL;
  }

  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getPersonalizedResources(translate, isUserUnder13));
  const [initialState] = useState<AccountSecurityPromptState>(() => ({
    // Immutable parameters:
    promptAssignment,
    username,

    // Immutable state:
    resources,
    requestService,

    // Mutable state:
    isFlowComplete: false,
    modalState,
    lastModalState: null,
    emailAddress: ''
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(accountSecurityPromptStateReducer, initialState);

  /*
   * Effects
   *
   * NOTE: These effects cannot go inside the reducer, since reducers must not
   * have side-effects with respect to the app state.
   */

  useEffect(() => runModalStateChangeEffect(eventService, state.modalState, state.lastModalState), [
    eventService,
    state.modalState,
    state.lastModalState
  ]);

  return (
    <AccountSecurityPromptContext.Provider value={{ state, dispatch }}>
      {children}
    </AccountSecurityPromptContext.Provider>
  );
};
