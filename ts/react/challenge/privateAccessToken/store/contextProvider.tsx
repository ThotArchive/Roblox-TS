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
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { PrivateAccessTokenAction } from './action';
import { PrivateAccessTokenState } from './state';
import privateAccessTokenStateReducer from './stateReducer';

export type PrivateAccessTokenContext = {
  state: PrivateAccessTokenState;
  dispatch: React.Dispatch<PrivateAccessTokenAction>;
};

export const PrivateAccessTokenContext = createContext<PrivateAccessTokenContext | null>(null);

type Props = {
  challengeId: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  translate: TranslateFunction;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
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
export const PrivateAccessTokenContextProvider = ({
  challengeId,
  renderInline,
  eventService,
  metricsService,
  requestService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<PrivateAccessTokenState>(() => ({
    // Immutable parameters:
    challengeId,
    renderInline,
    // Immutable state
    resources,
    eventService,
    metricsService,
    requestService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: false
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(privateAccessTokenStateReducer, initialState);

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

    eventService.sendChallengeInvalidatedEvent();
    metricsService.fireChallengeInvalidatedEvent();

    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated
  ]);

  return (
    <PrivateAccessTokenContext.Provider value={{ state, dispatch }}>
      {children}
    </PrivateAccessTokenContext.Provider>
  );
};
