import { useContext } from 'react';
import {
  emailVerifyCodeModalContext,
  TEmailVerifyCodeModalContext
} from '../store/emailVerifyCodeModalStoreContext';

/**
 * A wrapper around `useContext` for the prompt state, which throws if the
 * context has not actually been provided in the current component scope.
 */
const useEmailVerifyCodeModalContext: () => TEmailVerifyCodeModalContext = () => {
  const context = useContext(emailVerifyCodeModalContext);
  if (context === null) {
    throw new Error('EmailVerifyCodeModalContext was not provided in the current scope');
  }

  return context;
};

export default useEmailVerifyCodeModalContext;
