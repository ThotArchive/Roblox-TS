import { useContext } from 'react';
import { SystemFeedbackContext } from '../../components/SystemFeedbackProvider';

/**
 * To be used along side SystemFeedbackProvider, this hook gives access to the
 * TSystemFeedback components defined by the closest SystemFeedbackProvider
 * ancestor in a React tree. Each SystemFeedbackProvider creates a new instance
 * of TSystemFeedback to support isolation.
 *
 * @returns TsystemFeedback
 */
const useSystemFeedback = () => {
  const systemFeedbackProps = useContext(SystemFeedbackContext);

  if (!systemFeedbackProps) {
    throw Error(
      'invalid use of useSystemFeedback, ensure your component is wrapped in a `SystemFeedbackProvider`'
    );
  }

  return systemFeedbackProps;
};

export default useSystemFeedback;
