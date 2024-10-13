import {
  ADD_PHONE_NUMBER_PAGE,
  VERIFY_PHONE_NUMBER_PAGE,
  ADD_PHONE_SUCCESS_PAGE,
  PHONE_DISCOVERABILITY_CONSENT_PAGE
} from '../constants/pageConstants';
import { sectionValues } from '../../common/constants/loggingConstants';

const getSectionValueForPage = pageName => {
  switch (pageName) {
    case ADD_PHONE_NUMBER_PAGE:
      return sectionValues.addPhone;
    case VERIFY_PHONE_NUMBER_PAGE:
      return sectionValues.verifyPhone;
    case ADD_PHONE_SUCCESS_PAGE:
      return sectionValues.phoneAdded;
    case PHONE_DISCOVERABILITY_CONSENT_PAGE:
      return sectionValues.discoverabilityConsent;

    default:
      return '';
  }
};
export { getSectionValueForPage as default };
