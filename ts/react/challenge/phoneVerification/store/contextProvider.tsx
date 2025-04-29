import React, {
  createContext,
  ReactChild,
  ReactElement,
  useState,
  useReducer,
  useEffect
} from 'react';
import { TranslateFunction } from 'react-utilities';
import { PhoneVerificationAction } from './action';
import { PhoneVerificationState } from './state';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import phoneVerificationStateReducer from './stateReducer';
import { getResources } from '../constants/resources';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';

export type PhoneVerificationContext = {
  state: PhoneVerificationState;
  dispatch: React.Dispatch<PhoneVerificationAction>;
};

export const PhoneVerificationContext = createContext<PhoneVerificationContext | null>(null);

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

export const PhoneVerificationContextProvider = ({
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
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<PhoneVerificationState>(() => ({
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
  const [state, dispatch] = useReducer(phoneVerificationStateReducer, initialState);

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
    challengeId,
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated
  ]);

  return (
    <PhoneVerificationContext.Provider value={{ state, dispatch }}>
      {children}
    </PhoneVerificationContext.Provider>
  );
};
