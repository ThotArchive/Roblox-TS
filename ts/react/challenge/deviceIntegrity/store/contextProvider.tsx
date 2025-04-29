import React, {
  createContext,
  ReactChild,
  ReactElement,
  useState,
  useReducer,
  useEffect
} from 'react';
import { TranslateFunction } from 'react-utilities';
import { DeviceIntegrityAction } from './action';
import { DeviceIntegrityState } from './state';
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import deviceIntegrityStateReducer from './stateReducer';
import { getResources } from '../constants/resources';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';

export type DeviceIntegrityContext = {
  state: DeviceIntegrityState;
  dispatch: React.Dispatch<DeviceIntegrityAction>;
};

export const DeviceIntegrityContext = createContext<DeviceIntegrityContext | null>(null);

type Props = {
  challengeId: string;
  requestHash: string;
  integrityType: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
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

export const DeviceIntegrityContextProvider = ({
  challengeId,
  requestHash,
  integrityType,
  renderInline,
  eventService,
  metricsService,
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
  const [initialState] = useState<DeviceIntegrityState>(() => ({
    // Immutable parameters:
    challengeId,
    requestHash,
    integrityType,
    renderInline,
    // Immutable state
    resources,
    eventService,
    metricsService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: false
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(deviceIntegrityStateReducer, initialState);

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

    // eventService.sendChallengeInvalidatedEvent();
    // metricsService.fireChallengeInvalidatedEvent();
    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated
  ]);

  return (
    <DeviceIntegrityContext.Provider value={{ state, dispatch }}>
      {children}
    </DeviceIntegrityContext.Provider>
  );
};
