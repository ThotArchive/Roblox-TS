import PropTypes from 'prop-types';
import React, { createContext, useReducer } from 'react';
import { CLOSE_AGE_ESTIMATION_PROMPT_MODAL } from '../actions/actionTypes';

const initialState = {
  isOpen: true
};

const AgeEstimationStoreContext = createContext(initialState);

const reducer = (oldState, action) => {
  switch (action.type) {
    case CLOSE_AGE_ESTIMATION_PROMPT_MODAL:
      return {
        ...oldState,
        isOpen: false
      };
    default:
      return initialState;
  }
};

const AgeEstimationPromptModalStateProvider = ({ children }) => {
  const [ageEstimationPromptModalState, dispatch] = useReducer(reducer, initialState);
  return (
    <AgeEstimationStoreContext.Provider value={{ ageEstimationPromptModalState, dispatch }}>
      {children}
    </AgeEstimationStoreContext.Provider>
  );
};

AgeEstimationPromptModalStateProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { AgeEstimationPromptModalStateProvider, AgeEstimationStoreContext };
