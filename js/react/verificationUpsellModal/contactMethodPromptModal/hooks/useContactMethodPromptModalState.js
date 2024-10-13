import { useContext } from 'react';
import { ContactMethodPromptModalStoreContext } from '../stores/ContactMethodPromptModalStoreContext';

export default function useContactMethodPromptModalState() {
  return useContext(ContactMethodPromptModalStoreContext);
}
