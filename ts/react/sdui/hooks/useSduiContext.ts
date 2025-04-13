import { useMemo } from 'react';
import { useTokens } from 'react-utilities';
import { TSduiContext } from '../system/SduiTypes';

/**
 * Returns a context object that contains dependencies for SDUI components
 */
const useSduiContext = (): TSduiContext => {
  const tokens = useTokens();

  const dependencies = useMemo(() => {
    return {
      tokens
    };
  }, [tokens]);

  return useMemo(() => {
    return {
      dependencies
    };
  }, [dependencies]);
};

export default useSduiContext;
