import React, { createContext } from 'react';
import createSystemFeedback from '../utils/createSystemFeedback';

export const SystemFeedbackContext = createContext(undefined);

/**
 * Wraps the ReactNode with SystemFeedbackContext. Also see
 * ../utils/hooks/useSystemFeedback on how to conveniently access the
 * context provided here.
 */
export const SystemFeedbackProvider = ({ children }) => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  return (
    <SystemFeedbackContext.Provider
      value={{ SystemFeedbackComponent: SystemFeedback, systemFeedbackService }}>
      {children}
    </SystemFeedbackContext.Provider>
  );
};
