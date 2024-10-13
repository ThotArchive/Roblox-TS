import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import { CLOSE_CONTACT_METHOD_PROMPT_MODAL, SET_LOGGING_VALUES } from '../actions/actionTypes';

const initialState = {
  isOpen: true,
  origin: '',
  section: ''
};

const ContactMethodPromptModalStoreContext = createContext(initialState);

const reducer = (oldState, action) => {
  switch (action.type) {
    case CLOSE_CONTACT_METHOD_PROMPT_MODAL:
      return {
        ...oldState,
        isOpen: false
      };
    case SET_LOGGING_VALUES:
      return {
        ...oldState,
        origin: action.origin,
        section: action.section
      };
    default:
      return initialState;
  }
};

const ContactMethodPromptModalStateProvider = ({ children }) => {
  const [contactMethodPromptModalState, dispatch] = useReducer(reducer, initialState);

  return (
    <ContactMethodPromptModalStoreContext.Provider
      value={{ contactMethodPromptModalState, dispatch }}>
      {children}
    </ContactMethodPromptModalStoreContext.Provider>
  );
};

ContactMethodPromptModalStateProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ContactMethodPromptModalStoreContext, ContactMethodPromptModalStateProvider };
