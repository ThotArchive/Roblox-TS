import { useState, useEffect } from 'react';
import { getIntAuthCompliancePolicy } from '../services/intlAuthComplianceService';
import {
  isStrictComplianceEnabledForCountryBtid,
  isKoreaEnhancedComplianceEnabled
} from '../utils/complianceUtils';

type UseIntlAuthComplianceReturnType = {
  verifiedSignupCountry: string;
  parentalConsentId: string;
  shouldEnableStrictCompliance: boolean;
  shouldEnableKoreaEnhancedCompliance: boolean;
};

function useIntlAuthCompliance(): UseIntlAuthComplianceReturnType {
  const [parentalConsentId, setParentalConsentId] = useState('');
  const [verifiedSignupCountry, setVerifiedSignupCountry] = useState('');
  const [shouldEnableStrictCompliance, setShouldEnableStrictCompliance] = useState(false);

  // Korea specific feature to show checkbox UI
  const [shouldEnableKoreaEnhancedCompliance, setShouldEnableKoreaEnhancedCompliance] = useState(
    false
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          verifiedSignupCountry: country = '',
          isStrictComplianceEnabled: isFeatureSwitchOn = false,
          parentalConsentId: consentId = ''
        } = await getIntAuthCompliancePolicy();
        const isFeatureEnabled = await isStrictComplianceEnabledForCountryBtid(
          isFeatureSwitchOn,
          country
        );
        const isEnhancedComplianceEnabledForKorea = await isKoreaEnhancedComplianceEnabled(
          isFeatureEnabled,
          country
        );
        setVerifiedSignupCountry(country);
        setParentalConsentId(consentId);
        setShouldEnableStrictCompliance(isFeatureEnabled);
        setShouldEnableKoreaEnhancedCompliance(isEnhancedComplianceEnabledForKorea);
      } catch (error) {
        console.warn('strict compliance metadata error : ', error);
      }
    }
    // eslint-disable-next-line no-void
    void fetchData();
  }, []);

  return {
    verifiedSignupCountry,
    parentalConsentId,
    shouldEnableStrictCompliance,
    shouldEnableKoreaEnhancedCompliance
  };
}

export default useIntlAuthCompliance;
