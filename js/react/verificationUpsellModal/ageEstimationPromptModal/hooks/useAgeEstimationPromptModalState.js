import { useContext } from 'react';
import { AgeEstimationStoreContext } from '../stores/AgeEstimationPromptModalStoreContext';

export default function useAgeEstimationPromptModalState() {
  return useContext(AgeEstimationStoreContext);
}
