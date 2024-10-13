import { useContext } from 'react';
import { EmailUpsellModalStoreContext } from '../stores/EmailUpsellModalStoreContext';

export default function useEmailUpsellState() {
  return useContext(EmailUpsellModalStoreContext);
}
