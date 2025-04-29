import { useContext } from 'react';
import { PrivateAccessTokenContext } from '../store/contextProvider';

const usePrivateAccessTokenContext: () => PrivateAccessTokenContext = () => {
  const context = useContext(PrivateAccessTokenContext);
  if (context === null) {
    throw new Error('PrivateAccessTokenContext was not provided in the current scope');
  }

  return context;
};

export default usePrivateAccessTokenContext;
