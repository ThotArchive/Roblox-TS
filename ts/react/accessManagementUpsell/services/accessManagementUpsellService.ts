import { ModalEvent } from '../constants/viewConstants';

export const showAccessManagementVerificationModal = (): Promise<boolean> =>
  new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.OpenAccessManagementVerificationModal, {
      detail: {
        closeCallback: (success: boolean) => {
          resolve(success);
        }
      }
    });
    window.dispatchEvent(event);
  });

export default {
  showAccessManagementVerificationModal
};
