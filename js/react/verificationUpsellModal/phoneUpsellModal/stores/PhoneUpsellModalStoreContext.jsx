import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  SET_PAGE,
  SET_PHONE_NUMBER,
  SET_COUNTRY,
  SET_ERROR_MESSAGE,
  SET_PHONE_VERIFICATION_STATUS,
  SET_PREFIX_OPTIONS_LIST,
  SET_LOGGING_VALUES,
  SET_DISCOVERABILITY_CONSENT_PREFILL,
  CLOSE_PHONE_NUMBER_MODAL
} from '../actions/actionTypes';

import { ADD_PHONE_NUMBER_PAGE } from '../constants/pageConstants';
import { originValues } from '../../common/constants/loggingConstants';

const initialState = {
  isOpen: true,
  pageName: ADD_PHONE_NUMBER_PAGE,
  errorMessage: '',
  origin: originValues.unset,
  // phone number info
  phone: '',
  isPhoneVerified: false,
  phonePrefixPickerIndex: 0,
  phonePrefixOptionsList: [],
  shouldDiscoverabilityConsentDefaultYes: false
};

const PhoneUpsellModalStoreContext = createContext(initialState);

const reducer = (oldState, action) => {
  switch (action.type) {
    case SET_PHONE_NUMBER:
      return {
        ...oldState,
        phone: action.phone,
        errorMessage: ''
      };
    case SET_COUNTRY:
      return {
        ...oldState,
        phonePrefixPickerIndex: action.phonePrefixPickerIndex,
        errorMessage: ''
      };
    case SET_ERROR_MESSAGE:
      return {
        ...oldState,
        errorMessage: action.errorMessage
      };
    case SET_PAGE:
      return {
        ...oldState,
        errorMessage: '',
        pageName: action.pageName
      };
    case SET_PHONE_VERIFICATION_STATUS:
      return {
        ...oldState,
        isPhoneVerified: action.isPhoneVerified
      };
    case SET_DISCOVERABILITY_CONSENT_PREFILL:
      return {
        ...oldState,
        shouldPrefillAffirmativeDiscoverabilityConsent:
          action?.shouldPrefillAffirmativeDiscoverabilityConsent ?? false
      };
    case SET_PREFIX_OPTIONS_LIST:
      return {
        ...oldState,
        phonePrefixOptionsList: action.phonePrefixOptionsList
      };
    case SET_LOGGING_VALUES:
      return {
        ...oldState,
        origin: action.origin
      };
    case CLOSE_PHONE_NUMBER_MODAL:
      return {
        ...initialState,
        isOpen: false,
        errorMessage: ''
      };
    default:
      return initialState;
  }
};

const PhoneUpsellModalStateProvider = ({ children }) => {
  const [phoneUpsellState, dispatch] = useReducer(reducer, initialState);

  return (
    <PhoneUpsellModalStoreContext.Provider value={{ phoneUpsellState, dispatch }}>
      {children}
    </PhoneUpsellModalStoreContext.Provider>
  );
};

PhoneUpsellModalStateProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { PhoneUpsellModalStoreContext, PhoneUpsellModalStateProvider };
