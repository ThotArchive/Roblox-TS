import { useContext } from 'react';
import { ProofOfWorkContext } from '../store/contextProvider';

const useProofOfWorkContext: () => ProofOfWorkContext = () => {
  const context = useContext(ProofOfWorkContext);
  if (context === null) {
    throw new Error('ProofOfWorkContext was not provided in the current scope');
  }

  return context;
};

export default useProofOfWorkContext;
