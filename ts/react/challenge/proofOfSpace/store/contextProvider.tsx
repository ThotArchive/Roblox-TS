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
  Artifacts,
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { ProofOfSpaceAction, ProofOfSpaceActionType } from './action';
import { ProofOfSpaceState } from './state';
import proofOfSpaceStateReducer from './stateReducer';

export type ProofOfSpaceContext = {
  state: ProofOfSpaceState;
  dispatch: React.Dispatch<ProofOfSpaceAction>;
};

export const ProofOfSpaceContext = createContext<ProofOfSpaceContext | null>(null);

type Props = {
  challengeId: string;
  renderInline: boolean;
  artifacts: Artifacts;
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
export const ProofOfSpaceContextProvider = ({
  challengeId,
  renderInline,
  artifacts,
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
  const [initialState] = useState<ProofOfSpaceState>(() => ({
    // Immutable parameters:
    challengeId,
    renderInline,
    artifacts,
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
    isModalVisible: false,
    isAbandoned: false,
    progressWhenTimedOut: null
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(proofOfSpaceStateReducer, initialState);

  // Completion effect:
  useEffect(() => {
    // Ensure that other effect has not already fired.
    if (
      state.onChallengeCompletedData === null ||
      state.onChallengeInvalidatedData !== null ||
      state.isAbandoned ||
      state.progressWhenTimedOut !== null
    ) {
      return;
    }

    eventService.sendChallengeCompletedEvent();
    metricsService.fireChallengeCompletedEvent();

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.isAbandoned,
    state.progressWhenTimedOut,
    onChallengeCompleted
  ]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that other effect has not already fired.
    if (
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData === null ||
      state.isAbandoned ||
      state.progressWhenTimedOut !== null
    ) {
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
    state.isAbandoned,
    state.progressWhenTimedOut,
    onChallengeInvalidated
  ]);

  // Abandoned effect:
  useEffect(() => {
    // Ensure that other effect has not already fired.
    if (
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData !== null ||
      !state.isAbandoned ||
      state.progressWhenTimedOut !== null
    ) {
      return;
    }

    eventService.sendChallengeAbandonedEvent();
    metricsService.fireChallengeAbandonedEvent();

    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: ProofOfSpaceActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.isAbandoned,
    state.progressWhenTimedOut,
    onModalChallengeAbandoned
  ]);

  // Timeout effect:
  useEffect(() => {
    // Ensure that other effect has not already fired.
    if (
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData !== null ||
      state.isAbandoned ||
      state.progressWhenTimedOut === null
    ) {
      return;
    }

    eventService.sendChallengeTimeoutEvent(state.progressWhenTimedOut);
    metricsService.fireChallengeTimeoutEvent();

    // Completion with empty redemption to support failover.
    onChallengeCompleted({ redemptionToken: '' });
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.isAbandoned,
    state.progressWhenTimedOut,
    onChallengeCompleted
  ]);

  /*
   * Effects
   *
   * NOTE: These effects cannot go inside the reducer, since reducers must not
   * have side effects with respect to the app state.
   */

  return (
    <ProofOfSpaceContext.Provider value={{ state, dispatch }}>
      {children}
    </ProofOfSpaceContext.Provider>
  );
};
