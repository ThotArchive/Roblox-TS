import { useContext } from 'react';
import { PhoneUpsellModalStoreContext } from '../stores/PhoneUpsellModalStoreContext';

export default function usePhoneUpsellState() {
  return useContext(PhoneUpsellModalStoreContext);
}
