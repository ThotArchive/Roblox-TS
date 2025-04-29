import { useContext } from 'react';
import { EmailVerificationContext } from '../store/contextProvider';

const useEmailVerificationContext: () => EmailVerificationContext = () => {
  const context = useContext(EmailVerificationContext);
  if (context === null) {
    throw new Error('EmailVerificationContext was not provided in the current scope');
  }

  return context;
};

export default useEmailVerificationContext;
