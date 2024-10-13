import { useContext } from 'react';
import { PhoneVerificationContext } from '../store/contextProvider';

const usePhoneVerificationContext: () => PhoneVerificationContext = () => {
  const context = useContext(PhoneVerificationContext);
  if (context === null) {
    throw new Error('PhoneVerificationContext was not provided in the current scope');
  }

  return context;
};

export default usePhoneVerificationContext;
