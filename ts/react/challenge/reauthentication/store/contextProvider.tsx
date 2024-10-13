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
import { useActiveReauthenticationType } from '../hooks/useActiveReauthenticationType';
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
  ReauthenticationType,
  ReauthenticationMetadata
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { ReauthenticationAction } from './action';
import { ReauthenticationState } from './state';
import reauthenticationStateReducer from './stateReducer';

export type ReauthenticationContext = {
  state: ReauthenticationState;
  dispatch: React.Dispatch<ReauthenticationAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `reauthentication` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const ReauthenticationContext = createContext<ReauthenticationContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null
);

type Props = {
  renderInline: boolean;
  requestService: RequestService;
  metricsService: MetricsService;
  eventService: EventService;
  defaultType: ReauthenticationType;
  availableTypes: ReauthenticationType[];
  defaultTypeMetadata: ReauthenticationMetadata | null;
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
export const ReauthenticationContextProvider = ({
  renderInline,
  requestService,
  metricsService,
  eventService,
  defaultType,
  availableTypes,
  defaultTypeMetadata,
  translate,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<ReauthenticationState>(() => ({
    // Immutable parameters:
    renderInline,

    // Immutable state:
    resources,
    requestService,
    metricsService,
    eventService,
    defaultType,
    availableTypes,
    defaultTypeMetadata,
    onModalChallengeAbandoned,

    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: true,
    initialOtpSessionId: null
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(reauthenticationStateReducer, initialState);
  const activeReauthenticationType = useActiveReauthenticationType();

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

    metricsService.fireVerifiedEvent(activeReauthenticationType);
    eventService.sendChallengeCompletedEvent(activeReauthenticationType);
    onChallengeCompleted(state.onChallengeCompletedData);
  }, [
    activeReauthenticationType,
    metricsService,
    eventService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeCompleted
  ]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (state.onChallengeInvalidatedData === null || state.onChallengeCompletedData !== null) {
      return;
    }

    metricsService.fireInvalidatedEvent(activeReauthenticationType);
    eventService.sendChallengeInvalidatedEvent(activeReauthenticationType);
    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    activeReauthenticationType,
    metricsService,
    eventService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated
  ]);

  // Track active reauthentication type:
  useEffect(() => {
    eventService.sendReauthenticationTypeChangedEvent(activeReauthenticationType);
  }, [activeReauthenticationType, eventService]);

  return (
    <ReauthenticationContext.Provider value={{ state, dispatch }}>
      {children}
    </ReauthenticationContext.Provider>
  );
};
