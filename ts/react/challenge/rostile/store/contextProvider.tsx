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
  OnModalChallengeAbandonedCallback,
  PuzzleType
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { RostileAction, RostileActionType } from './action';
import { RostileState } from './state';
import rostileStateReducer from './stateReducer';

export type RostileContext = {
  state: RostileState;
  dispatch: React.Dispatch<RostileAction>;
};

export const RostileContext = createContext<RostileContext | null>(null);

type Props = {
  challengeId: string;
  puzzleType: PuzzleType;
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
export const RostileContextProvider = ({
  challengeId,
  puzzleType,
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
  const [initialState] = useState<RostileState>(() => ({
    // Immutable parameters:
    challengeId,
    puzzleType,
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
    isAbandoned: false,
    isModalVisible: false
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(rostileStateReducer, initialState);

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

    eventService.sendChallengeCompletedEvent();
    metricsService.fireChallengeCompletedEvent();

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeCompleted
  ]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (
      state.isAbandoned ||
      state.onChallengeInvalidatedData === null ||
      state.onChallengeCompletedData !== null
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
    onChallengeInvalidated,
    state.isAbandoned
  ]);

  // Abandoned effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (
      !state.isAbandoned ||
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData !== null
    ) {
      return;
    }

    eventService.sendChallengeAbandonedEvent();
    metricsService.fireChallengeAbandonedEvent();

    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: RostileActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.isAbandoned,
    onChallengeInvalidated,
    onModalChallengeAbandoned
  ]);

  return <RostileContext.Provider value={{ state, dispatch }}>{children}</RostileContext.Provider>;
};
