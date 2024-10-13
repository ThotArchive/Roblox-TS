import { useEffect } from 'react';
import { defaultRedirect } from '../utils/browserUtils';

/**
 * Redirect user to homepage if condition is true
 * @param condition If true, redirect to home page
 */
function useRedirectHomeIf(condition: boolean): void {
  useEffect(() => {
    if (condition) {
      defaultRedirect();
    }
  }, [condition]);
}

export default useRedirectHomeIf;
