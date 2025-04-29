import { useContext } from 'react';
import { ProofOfSpaceContext } from '../store/contextProvider';

const useProofOfSpaceContext: () => ProofOfSpaceContext = () => {
  const context = useContext(ProofOfSpaceContext);
  if (context === null) {
    throw new Error('ProofOfSpaceContext was not provided in the current scope');
  }

  return context;
};

export default useProofOfSpaceContext;
