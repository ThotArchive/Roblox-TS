import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import { sectionValues } from '../../common/constants/loggingConstants';

// eslint-disable-next-line import/prefer-default-export
export const getSectionValueForPage = pageType => {
  switch (pageType) {
    case verificationUpsellConstants.Verification:
      return sectionValues.verifyEmail;
    case verificationUpsellConstants.UpdateEmail:
      return sectionValues.addEmail;
    default:
      return '';
  }
};
