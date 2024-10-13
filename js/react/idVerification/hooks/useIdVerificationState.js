import { useContext } from 'react';
import { IdVerificationStoreContext } from '../stores/IdVerificationStoreContext';

export default function useIdVerificationState() {
  return useContext(IdVerificationStoreContext);
}
