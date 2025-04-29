import { createContext, useMemo } from "react";
import PropTypes from "prop-types";
import createSystemFeedback from "../utils/createSystemFeedback";

export const SystemFeedbackContext = createContext(undefined);

/**
 * Wraps the ReactNode with SystemFeedbackContext. Also see
 * ../utils/hooks/useSystemFeedback on how to conveniently access the
 * context provided here.
 */
const SystemFeedbackProvider = ({ children }) => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  const feedback = useMemo(
    () => ({ SystemFeedbackComponent: SystemFeedback, systemFeedbackService }),
    [SystemFeedback, systemFeedbackService],
  );
  return (
    <SystemFeedbackContext.Provider value={feedback}>{children}</SystemFeedbackContext.Provider>
  );
};

SystemFeedbackProvider.defaultProps = {
  children: null,
};

SystemFeedbackProvider.propTypes = {
  children: PropTypes.node,
};

export default SystemFeedbackProvider;
