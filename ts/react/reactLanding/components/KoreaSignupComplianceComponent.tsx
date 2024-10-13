import React, { useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { oneTimePassTranslationConfig } from '../translation.config';

import { koreaComplianceSignupStrings } from '../constants/signupConstants';
import KoreaComplianceCheckbox from './KoreaComplianceCheckbox';
import { KoreaComplianceCheckboxType } from '../utils/KoreaComplianceCheckboxUtil';
import { KoreaSignupCompliancePolicyCheckboxType } from '../../common/types/signupTypes';
import { getIsKoreaSignupPoliciesAgreementButtonDisabled } from '../utils/signupUtils';
import {
  sendKoreaConsentAllCheckboxClickEvent,
  sendKoreaTosAndPrivacyPolicyCheckboxClickEvent,
  sendKoreaThirdPartyPersonalInfoCheckboxClickEvent,
  sendKoreaTransferPersonalInfoCheckboxClickEvent,
  sendKoreaPersonalInfoCheckboxClickEvent,
  sendKoreaOptionalPersonalInfoCheckboxClickEvent,
  sendKoreaAgreeTermsOfServiceButtonClickEvent
} from '../services/eventService';

export type KoreaSignupComplianceComponentProps = {
  translate: WithTranslationsProps['translate'];
  onComplete: (agreementType: KoreaSignupCompliancePolicyCheckboxType) => void;
  isUnderThresholdAgeForCountry: boolean;
};

const KoreaSignupComplianceComponent = ({
  translate,
  onComplete,
  isUnderThresholdAgeForCountry
}: KoreaSignupComplianceComponentProps): JSX.Element => {
  const [isTosAndPrivacyPolicyChecked, setIsTosAndPrivacyPolicyChecked] = useState(false);
  const [
    isThirdPartyPersonalInformationPolicyChecked,
    setIsThirdPartyPersonalInformationPolicyChecked
  ] = useState(false);
  const [
    isTransferPersonalInformationPolicyChecked,
    setIsTransferPersonalInformationPolicyChecked
  ] = useState(false);
  const [isPersonalInformationPolicyChecked, setIsPersonalInformationPolicyChecked] = useState(
    false
  );
  const [
    isOptionalPersonalInformationPolicyChecked,
    setIsOptionalPersonalInformationPolicyChecked
  ] = useState(false);
  const [isConsentToAllPoliciesChecked, setIsConsentToAllPoliciesChecked] = useState(false);

  const handleConsentToAllPoliciesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendKoreaConsentAllCheckboxClickEvent(e.target.checked);

    setIsConsentToAllPoliciesChecked(e.target.checked);
    setIsTosAndPrivacyPolicyChecked(e.target.checked);
    setIsThirdPartyPersonalInformationPolicyChecked(e.target.checked);
    setIsTransferPersonalInformationPolicyChecked(e.target.checked);
    setIsOptionalPersonalInformationPolicyChecked(e.target.checked);
    setIsPersonalInformationPolicyChecked(e.target.checked);
  };

  const handleTosAndPrivacyPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendKoreaTosAndPrivacyPolicyCheckboxClickEvent(e.target.checked);

    setIsTosAndPrivacyPolicyChecked(e.target.checked);
    if (!e.target.checked) {
      setIsConsentToAllPoliciesChecked(e.target.checked);
    }
  };

  const handleThirdPartyPersonalInformationPolicyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    sendKoreaThirdPartyPersonalInfoCheckboxClickEvent(e.target.checked);

    setIsThirdPartyPersonalInformationPolicyChecked(e.target.checked);
    if (!e.target.checked) {
      setIsConsentToAllPoliciesChecked(e.target.checked);
    }
  };

  const handleTransferPersonalInformationPolicyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    sendKoreaTransferPersonalInfoCheckboxClickEvent(e.target.checked);

    setIsTransferPersonalInformationPolicyChecked(e.target.checked);
    if (!e.target.checked) {
      setIsConsentToAllPoliciesChecked(e.target.checked);
    }
  };

  const handlePersonalInformationPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendKoreaPersonalInfoCheckboxClickEvent(e.target.checked);

    setIsPersonalInformationPolicyChecked(e.target.checked);
    if (!e.target.checked) {
      setIsConsentToAllPoliciesChecked(e.target.checked);
    }
  };

  const handleOptionalPersonalInformationPolicyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    sendKoreaOptionalPersonalInfoCheckboxClickEvent(e.target.checked);

    setIsOptionalPersonalInformationPolicyChecked(e.target.checked);
    if (!e.target.checked) {
      setIsConsentToAllPoliciesChecked(e.target.checked);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    sendKoreaAgreeTermsOfServiceButtonClickEvent();

    setIsSubmitting(true);
    const agreementType = isConsentToAllPoliciesChecked
      ? KoreaSignupCompliancePolicyCheckboxType.All
      : KoreaSignupCompliancePolicyCheckboxType.Required;
    onComplete(agreementType);
  };

  const isPolicyAgreeButtonEnabled = (): boolean => {
    return (
      isConsentToAllPoliciesChecked ||
      (isPersonalInformationPolicyChecked &&
        isTosAndPrivacyPolicyChecked &&
        isThirdPartyPersonalInformationPolicyChecked &&
        isTransferPersonalInformationPolicyChecked)
    );
  };

  return (
    <div className='signup-container theme-bg rbx-login-form'>
      <h4 className='text-center signup-header'>
        {translate(
          isUnderThresholdAgeForCountry
            ? koreaComplianceSignupStrings.ParentConsentNeeded
            : koreaComplianceSignupStrings.ConsentNeeded
        )}
      </h4>
      <div className='text-left korea-compliance-description-text-margin-left korea-compliance-description-text-margin-right small text'>
        {translate(
          isUnderThresholdAgeForCountry
            ? koreaComplianceSignupStrings.ReviewAndConsentToTerms
            : koreaComplianceSignupStrings.KoreaConsentTermsforAbove14users
        )}
      </div>
      <div className='signup-or-log-in'>
        <div className='signup-container'>
          <div className='signup-input-area'>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isConsentToAllPoliciesChecked}
                onCheckBoxChanged={handleConsentToAllPoliciesChange}
                checkboxType={KoreaComplianceCheckboxType.CONSENT_TO_ALL_TERMS}
              />
            </div>
            <div className='rbx-divider korea-compliance-margin-top' />
            <div className='text-left korea-compliance-text-margin-left korea-compliance-margin-top small text'>
              {translate(koreaComplianceSignupStrings.Required)}
            </div>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isTosAndPrivacyPolicyChecked}
                onCheckBoxChanged={handleTosAndPrivacyPolicyChange}
                checkboxType={KoreaComplianceCheckboxType.USER_AGREEMENT_PRIVACY_POLICY}
              />
            </div>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isThirdPartyPersonalInformationPolicyChecked}
                onCheckBoxChanged={handleThirdPartyPersonalInformationPolicyChange}
                checkboxType={
                  KoreaComplianceCheckboxType.THIRD_PARTY_PROVISION_OF_PERSONAL_INFORMATION
                }
              />
            </div>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isTransferPersonalInformationPolicyChecked}
                onCheckBoxChanged={handleTransferPersonalInformationPolicyChange}
                checkboxType={KoreaComplianceCheckboxType.OVERSEAS_TRANSFER_OF_PERSONAL_INFORMATION}
              />
            </div>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isPersonalInformationPolicyChecked}
                onCheckBoxChanged={handlePersonalInformationPolicyChange}
                checkboxType={
                  KoreaComplianceCheckboxType.COLLECTION_OF_REQUIRED_PERSONAL_INFORMATION
                }
              />
            </div>
            <div className='rbx-divider korea-compliance-margin-top' />
            <div className='text-left korea-compliance-text-margin-left korea-compliance-margin-top small text'>
              {translate(koreaComplianceSignupStrings.Optional)}
            </div>
            <div className='korea-compliance-margin-between-checkboxes korea-compliance-checkbox-label'>
              <KoreaComplianceCheckbox
                locale=''
                translate={translate}
                isChecked={isOptionalPersonalInformationPolicyChecked}
                onCheckBoxChanged={handleOptionalPersonalInformationPolicyChange}
                checkboxType={
                  KoreaComplianceCheckboxType.COLLECTION_OF_OPTIONAL_PERSONAL_INFORMATION
                }
              />
            </div>
            <button
              id='signup-agreements-button'
              type='button'
              className='btn-primary-md signup-submit-button btn-full-width'
              name='signupAgreementsSubmit'
              disabled={getIsKoreaSignupPoliciesAgreementButtonDisabled(
                isPolicyAgreeButtonEnabled(),
                isSubmitting
              )}
              onClick={() => handleSubmit()}>
              {translate(koreaComplianceSignupStrings.Agree)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(KoreaSignupComplianceComponent, oneTimePassTranslationConfig);
