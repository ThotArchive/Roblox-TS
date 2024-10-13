import React, {
  createContext,
  ReactChild,
  ReactElement,
  useState,
  useReducer,
  useEffect
} from 'react';

import { TranslateFunction } from 'react-utilities';
import { EmailVerificationAction } from './action';
import { EmailVerificationState } from './state';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import emailVerificationStateReducer from './stateReducer';
import { getResources } from '../constants/resources';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';

export type EmailVerificationContext = {
  state: EmailVerificationState;
  dispatch: React.Dispatch<EmailVerificationAction>;
};

export const EmailVerificationContext = createContext<EmailVerificationContext | null>(null);

type Props = {
  challengeId: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
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

export const EmailVerificationContextProvider = ({
  challengeId,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<EmailVerificationState>(() => ({
    // Immutable parameters:
    challengeId,
    renderInline,
    // Immutable state
    translate,
    resources,
    eventService,
    metricsService,
    onModalChallengeAbandoned,
    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: true
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(emailVerificationStateReducer, initialState);

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
    if (state.onChallengeCompletedData !== null || state.onChallengeInvalidatedData === null) {
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
    <EmailVerificationContext.Provider value={{ state, dispatch }}>
      {children}
    </EmailVerificationContext.Provider>
  );
};
