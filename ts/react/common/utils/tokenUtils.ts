import { localStorageService } from 'core-roblox-utilities';
import { chargebackWizardSessionToken } from '../constants/commonConstants';

export const widResult = (): string | undefined => {
  const widFromCache = localStorageService.getLocalStorage(chargebackWizardSessionToken) as
    | string
    | undefined;
  return widFromCache;
};

export default {
  widResult
};
