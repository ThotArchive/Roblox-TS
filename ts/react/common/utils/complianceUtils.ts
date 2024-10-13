import {
  complianceConstants,
  experimentVariables
} from '../../reactLanding/constants/signupConstants';
import { experimentLayer } from '../../reactLanding/constants/landingConstants';
import getExperimentsForLayer from '../services/ixpService';

const GLOBAL_THRESHOLD_AGE = 13;

export const isStrictComplianceEnabledForCountry = (
  isStrictComplianceEnabled: boolean,
  country: string
): boolean => {
  return (
    isStrictComplianceEnabled &&
    (country === complianceConstants.Brazil.name || country === complianceConstants.Korea.name)
  );
};

export const isKoreaEnhancedComplianceEnabled = async (
  isStrictComplianceEnabled: boolean,
  country: string
): Promise<boolean> => {
  const data = await getExperimentsForLayer(experimentLayer);
  return (
    isStrictComplianceEnabled &&
    country === complianceConstants.Korea.name &&
    data[experimentVariables.isKoreaEnhancedComplianceEnabled] === true
  );
};

export const isUnderThresholdAgeForCountry = (
  year: string,
  month: string,
  day: string,
  country?: string
): boolean => {
  if (!year || !month || !day) {
    return false;
  }
  let thresholdAge = GLOBAL_THRESHOLD_AGE;
  switch (country) {
    case complianceConstants.Brazil.name:
      thresholdAge = complianceConstants.Brazil.ageThreshold;
      break;
    case complianceConstants.Korea.name:
      thresholdAge = complianceConstants.Korea.ageThreshold;
      break;
    default:
      break;
  }
  const inputDate = new Date(`${month} ${day} ${year}`);
  const cutOffDate = new Date();
  cutOffDate.setFullYear(cutOffDate.getFullYear() - thresholdAge);
  return inputDate > cutOffDate;
};

export const isStrictComplianceIXPEnabledForCountryBtid = async (
  country: string
): Promise<boolean> => {
  const data = await getExperimentsForLayer(experimentLayer);
  if (country === complianceConstants.Brazil.name) {
    return data[experimentVariables.isStrictComplianceEnabledForBrazil] === true;
  }
  if (country === complianceConstants.Korea.name) {
    return data[experimentVariables.isStrictComplianceEnabledForKorea] === true;
  }
  return false;
};

// This function controls the release of the strict compliance for korean users.
export const isStrictComplianceEnabledForCountryBtid = async (
  isStrictComplianceEnabled: boolean,
  country: string
): Promise<boolean> => {
  // turn on the strict compliance feature when all conditions met
  // 1. feature switch is on
  // 2. country === target launching country
  // 3. btid is in the test variant
  if (isStrictComplianceEnabled) {
    // only call ixp api when country enabled strict compliance.
    // return isStrictComplianceIXPEnabledForCountryBtid(country);
    return true;

    // updated 12/5/2023 by wying
    // introduce strict + enhanced korea compliance experiment to test against default strict compliance behavior
  }
  return Promise.resolve(false);
};

export default {
  isStrictComplianceEnabledForCountry,
  isUnderThresholdAgeForCountry,
  isStrictComplianceEnabledForCountryBtid
};
