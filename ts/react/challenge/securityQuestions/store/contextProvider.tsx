import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useReducer,
  useState
} from 'react';
import { TranslateFunction } from 'react-utilities';
import { RequestService } from '../../../../common/request';
import { getResources } from '../constants/resources';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { SecurityQuestionsAction } from './action';
import { SecurityQuestionsState } from './state';
import securityQuestionsStateReducer from './stateReducer';

export type SecurityQuestionsContext = {
  state: SecurityQuestionsState;
  dispatch: React.Dispatch<SecurityQuestionsAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `securityQuestions` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const SecurityQuestionsContext = createContext<SecurityQuestionsContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null
);

type Props = {
  userId: string;
  sessionId: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  translate: TranslateFunction;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const SecurityQuestionsContextProvider = ({
  userId,
  sessionId,
  renderInline,
  eventService,
  metricsService,
  requestService,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<SecurityQuestionsState>(() => ({
    // Immutable parameters:
    userId,
    sessionId,
    renderInline,

    // Immutable state:
    resources,
    eventService,
    metricsService,
    requestService,
    onModalChallengeAbandoned,

    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: true
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(securityQuestionsStateReducer, initialState);

  /*
   * Effects
   *
   * NOTE: These effects cannot go inside the reducer, since reducers must not
   * have side-effects with respect to the app state.
   */

  // Completion effect:
  useEffect(() => {
    // Ensure that invalidation effect has not already fired.
    if (state.onChallengeCompletedData === null || state.onChallengeInvalidatedData !== null) {
      return;
    }

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [state.onChallengeCompletedData, state.onChallengeInvalidatedData, onChallengeCompleted]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (state.onChallengeInvalidatedData === null || state.onChallengeCompletedData !== null) {
      return;
    }

    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [state.onChallengeCompletedData, state.onChallengeInvalidatedData, onChallengeInvalidated]);

  return (
    <SecurityQuestionsContext.Provider value={{ state, dispatch }}>
      {children}
    </SecurityQuestionsContext.Provider>
  );
};
