import { localStorageService } from 'core-roblox-utilities';

const AGE_ESTIMATION_MODAL_KEY = 'FacialScanModalShown';

const ageEstimationModalAlreadyShown = () => {
  const val = localStorageService.getLocalStorage(AGE_ESTIMATION_MODAL_KEY);
  return val === null || val === true;
};

const shouldShowModal = access => {
  return access === 'Denied' || access === 'Actionable';
};

const setAgeEstimationModalShown = () => {
  localStorageService.setLocalStorage(AGE_ESTIMATION_MODAL_KEY, true);
};

const setAgeEstimationModalNotShown = () => {
  localStorageService.setLocalStorage(AGE_ESTIMATION_MODAL_KEY, null);
};

export {
  ageEstimationModalAlreadyShown,
  setAgeEstimationModalNotShown,
  setAgeEstimationModalShown,
  shouldShowModal
};
