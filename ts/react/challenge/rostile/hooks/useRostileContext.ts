import { useContext } from 'react';
import { RostileContext } from '../store/contextProvider';

const useRostileContext: () => RostileContext = () => {
  const context = useContext(RostileContext);
  if (context === null) {
    throw new Error('RostileContext was not provided in the current scope');
  }

  return context;
};

export default useRostileContext;
