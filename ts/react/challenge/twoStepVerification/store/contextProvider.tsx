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
import { TIMEOUT_BEFORE_CALLBACK_MILLISECONDS } from '../app.config';
import { getResources } from '../constants/resources';
import { useActiveMediaType } from '../hooks/useActiveMediaType';
import {
  ActionType,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { TwoStepVerificationAction } from './action';
import { TwoStepVerificationState } from './state';
import TwoStepVerificationStateReducer from './stateReducer';

export type TwoStepVerificationContext = {
  state: TwoStepVerificationState;
  dispatch: React.Dispatch<TwoStepVerificationAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `twoStepVerification` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const TwoStepVerificationContext = createContext<TwoStepVerificationContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null
);

type Props = {
  userId: string;
  challengeId: string;
  actionType: ActionType;
  renderInline: boolean;
  shouldShowRememberDeviceCheckbox: boolean;
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
export const TwoStepVerificationContextProvider = ({
  userId,
  challengeId,
  actionType,
  renderInline,
  shouldShowRememberDeviceCheckbox,
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
  const [initialState] = useState<TwoStepVerificationState>(() => ({
    // Immutable parameters:
    userId,
    challengeId,
    actionType,
    renderInline,
    shouldShowRememberDeviceCheckbox,

    // Immutable state:
    resources,
    eventService,
    metricsService,
    requestService,
    onModalChallengeAbandoned,

    // Mutable state:
    metadata: null,
    userConfiguration: null,
    enabledMediaTypes: [],
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: true
  }));
  const activeMediaType = useActiveMediaType();

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(TwoStepVerificationStateReducer, initialState);

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

    // eslint-disable-next-line prefer-destructuring
    const onChallengeCompletedData = state.onChallengeCompletedData;

    // Set a timeout to ensure that any events and metrics have a better chance
    // to complete.
    setTimeout(
      () => onChallengeCompleted(onChallengeCompletedData),
      TIMEOUT_BEFORE_CALLBACK_MILLISECONDS
    );
  }, [state.onChallengeCompletedData, state.onChallengeInvalidatedData, onChallengeCompleted]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (state.onChallengeInvalidatedData === null || state.onChallengeCompletedData !== null) {
      return;
    }

    eventService.sendChallengeInvalidatedEvent(activeMediaType);
    metricsService.fireInvalidatedEvent();

    // eslint-disable-next-line prefer-destructuring
    const onChallengeInvalidatedData = state.onChallengeInvalidatedData;

    // Set a timeout to ensure that any events and metrics have a better chance
    // to complete.
    setTimeout(
      () => onChallengeInvalidated(onChallengeInvalidatedData),
      TIMEOUT_BEFORE_CALLBACK_MILLISECONDS
    );
  }, [
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated,
    eventService,
    metricsService,
    activeMediaType
  ]);

  useEffect(() => {
    if (activeMediaType !== null) {
      eventService.sendMediaTypeChangedEvent(activeMediaType);
    }
  }, [eventService, activeMediaType]);

  return (
    <TwoStepVerificationContext.Provider value={{ state, dispatch }}>
      {children}
    </TwoStepVerificationContext.Provider>
  );
};
