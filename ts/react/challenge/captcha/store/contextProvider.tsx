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
import { GetMetadataReturnType } from '../../../../common/request/types/captcha';
import { getResources } from '../constants/resources';
import {
  ActionType,
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import { CaptchaReducerAction } from './action';
import { CaptchaState } from './state';
import captchaStateReducer from './stateReducer';

export type CaptchaContext = {
  state: CaptchaState;
  dispatch: React.Dispatch<CaptchaReducerAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `captcha` web app, containing both the app's state as well  as a function to
 * dispatch actions on the state.
 */
export const CaptchaContext = createContext<CaptchaContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null
);

type Props = {
  actionType: ActionType;
  appType: string | null;
  dataExchangeBlob: string;
  unifiedCaptchaId: string;
  renderInline: boolean;
  requestService: RequestService;
  metadataResponse: GetMetadataReturnType;
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
export const CaptchaContextProvider = ({
  actionType,
  appType,
  renderInline,
  dataExchangeBlob,
  unifiedCaptchaId,
  requestService,
  metadataResponse,
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
  const [initialState] = useState<CaptchaState>(() => ({
    // Immutable parameters:
    actionType,
    appType,
    dataExchangeBlob,
    unifiedCaptchaId,
    renderInline,
    metadataResponse,

    // Immutable state:
    resources,
    requestService,
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
  const [state, dispatch] = useReducer(captchaStateReducer, initialState);

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

  return <CaptchaContext.Provider value={{ state, dispatch }}>{children}</CaptchaContext.Provider>;
};
