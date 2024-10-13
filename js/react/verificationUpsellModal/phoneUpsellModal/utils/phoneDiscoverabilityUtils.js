import {
  ADD_PHONE_SUCCESS_PAGE,
  PHONE_DISCOVERABILITY_CONSENT_PAGE
} from '../constants/pageConstants';
import { getPhoneDiscoverabilityPageMetadata } from '../services/phoneDiscoverabilityConsentService';

// eslint-disable-next-line import/prefer-default-export
export const getPhoneVerificationSuccessPageAndAffirmativeConsentPrefill = async () => {
  // ADD_PHONE_SUCCESS_PAGE is default success page if not eligible for the
  // Discoverability Upsell
  let successPage = ADD_PHONE_SUCCESS_PAGE;
  let shouldPrefillAffirmativeDiscoverabilityConsent = false;
  const metadata = await getPhoneDiscoverabilityPageMetadata();
  if (
    metadata?.isDiscoverabilitySettingsEnabled === true &&
    metadata?.showDiscoverabilityUpsells === true
  ) {
    successPage = PHONE_DISCOVERABILITY_CONSENT_PAGE;
    shouldPrefillAffirmativeDiscoverabilityConsent =
      metadata?.prefillDiscoverabilitySetting === true;
  }
  return { successPage, shouldPrefillAffirmativeDiscoverabilityConsent };
};
