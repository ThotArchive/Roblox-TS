import { ModalEvent } from '../accessManagement/constants/viewConstants';
import { Access } from '../enums';
import { TAccessManagementUpsellParams } from '../types/AmpTypes';

const isFeatureAccessGranted = (access: Access) => {
  return access === Access.Granted;
};

export const startAccessManagementUpsell = async ({
  featureName,
  redirectLink = null,
  ampFeatureCheckData = [],
  isAsyncCall = true,
  usePrologue = false,
  ampRecourseData = null
}: TAccessManagementUpsellParams): Promise<boolean> => {
  return new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.StartAccessManagementUpsell, {
      detail: {
        featureName,
        redirectLink,
        ampFeatureCheckData,
        isAsyncCall,
        usePrologue,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ampRecourseData,
        closeCallback: (access: Access) => {
          resolve(isFeatureAccessGranted(access));
        }
      }
    });
    window.dispatchEvent(event);
  });
};

export default {
  startAccessManagementUpsell
};
