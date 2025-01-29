import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import { originValues } from '../../common/constants/loggingConstants';
import { sendVerificationUpsellEvent } from '../../common/utils/loggingUtils';
import {
  CLOSE_PHONE_NUMBER_MODAL,
  SET_LOGGING_VALUES,
  SET_DISCOVERABILITY_CONSENT_PREFILL,
  SET_PAGE
} from '../actions/actionTypes';
// components
import AddPhoneNumber from '../components/AddPhoneNumber';
import AddPhoneSuccess from '../components/AddPhoneSuccess';
import PhoneDiscoverabilityConsent from '../components/PhoneDiscoverabilityConsent';
import VerifyPhoneNumber from '../components/VerifyPhoneNumber';
import DeletePhoneNumber from '../components/DeletePhoneNumber';
// pages
import {
  ADD_PHONE_NUMBER_PAGE,
  ADD_PHONE_SUCCESS_PAGE,
  PHONE_DISCOVERABILITY_CONSENT_PAGE,
  VERIFY_PHONE_NUMBER_PAGE,
  DELETE_PHONE_CONFIRM_PAGE
} from '../constants/pageConstants';
import events from '../constants/phoneVerificationEventStreamConstants';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import getSectionValueForPage from '../utils/loggingUtils';
import { getPhoneVerificationSuccessPageAndAffirmativeConsentPrefill } from '../utils/phoneDiscoverabilityUtils';

function PhoneUpsellModalContainer({
  translate,
  onClose,
  origin,
  existingPhoneNumber,
  addPhoneAlwaysShowLegalText,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess,
  renderInWebview
}) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const [phoneVerificationSuccessPage, setPhoneVerificationSuccessPage] = useState(
    ADD_PHONE_SUCCESS_PAGE
  );
  const [overrideSuccessHeadingKey, setOverrideSuccessHeadingKey] = useState(undefined);
  const [overrideSuccessDescriptionKey, setOverrideSuccessDescriptionKey] = useState(undefined);
  const section = getSectionValueForPage(phoneUpsellState.pageName);
  const onHide = () => {
    sendVerificationUpsellEvent(events.phoneNumberModalDismissed, {
      origin: phoneUpsellState.origin,
      section
    });
    onClose(phoneUpsellState.isPhoneVerified);
    dispatch({ type: CLOSE_PHONE_NUMBER_MODAL });
  };
  const onVerify = async () => {
    if (beforeSuccess) {
      try {
        const [successHeadingKey, successDescriptionKey] = await beforeSuccess();
        setOverrideSuccessHeadingKey(successHeadingKey);
        setOverrideSuccessDescriptionKey(successDescriptionKey);
      } catch (error) {
        console.error(`Error from before success hook in phone verification: ${error}`, error);
      }
    }
    dispatch({ type: SET_PAGE, pageName: phoneVerificationSuccessPage });
  };
  const modalContent = () => {
    switch (phoneUpsellState.pageName) {
      case ADD_PHONE_NUMBER_PAGE:
        return (
          <AddPhoneNumber
            translate={translate}
            onHide={onHide}
            existingPhoneNumber={existingPhoneNumber}
            alwaysShowLegalText={addPhoneAlwaysShowLegalText}
            requireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
            headingKey={addPhoneHeadingKey}
            descriptionKey={addPhoneDescriptionKey}
            legalTextKey={addPhoneLegalTextKey}
            buttonKey={addPhoneButtonKey}
          />
        );
      case VERIFY_PHONE_NUMBER_PAGE:
        return <VerifyPhoneNumber translate={translate} onHide={onHide} onVerify={onVerify} />;
      case ADD_PHONE_SUCCESS_PAGE:
        return (
          <AddPhoneSuccess
            translate={translate}
            onHide={onHide}
            headingKey={overrideSuccessHeadingKey}
            descriptionKey={overrideSuccessDescriptionKey}
          />
        );
      case DELETE_PHONE_CONFIRM_PAGE:
        return (
          <DeletePhoneNumber
            translate={translate}
            existingPhoneNumber={existingPhoneNumber}
            onHide={onHide}
          />
        );
      case PHONE_DISCOVERABILITY_CONSENT_PAGE:
        return (
          <PhoneDiscoverabilityConsent
            translate={translate}
            onHide={onHide}
            origin={phoneUpsellState.origin}
            shouldPrefillAffirmativeDiscoverabilityConsent={
              phoneUpsellState.shouldPrefillAffirmativeDiscoverabilityConsent
            }
            headingKey={overrideSuccessHeadingKey}
            descriptionKey={overrideSuccessDescriptionKey}
          />
        );
      default:
        return <AddPhoneNumber translate={translate} onHide={onHide} />;
    }
  };

  useEffect(() => {
    // don't log impression until the origin value is set in state.
    if (phoneUpsellState.origin !== originValues.unset) {
      sendVerificationUpsellEvent(events.phoneNumberModalShown, {
        origin: phoneUpsellState.origin,
        section
      });
    }
  }, [phoneUpsellState.pageName, phoneUpsellState.origin]);

  useEffect(() => {
    // set initial state
    dispatch({ type: SET_LOGGING_VALUES, origin });
  }, []);

  useEffect(() => {
    async function fetchPhoneSuccessPage() {
      // fetch details about what success page to go to next after verification
      const {
        successPage,
        shouldPrefillAffirmativeDiscoverabilityConsent
      } = await getPhoneVerificationSuccessPageAndAffirmativeConsentPrefill();
      dispatch({
        type: SET_DISCOVERABILITY_CONSENT_PREFILL,
        shouldPrefillAffirmativeDiscoverabilityConsent
      });
      setPhoneVerificationSuccessPage(successPage);
    }

    if (origin !== originValues.challenge) {
      fetchPhoneSuccessPage();
    }
  }, []);

  return (
    <Modal
      show={phoneUpsellState.isOpen}
      onHide={onHide}
      /* eslint-enable */
      className={renderInWebview ? 'phone-verification-webview' : 'verification-modal'}
      size='lg'
      aria-labelledby='verification-upsell-modal-title'
      scrollable='true'
      centered='true'>
      {modalContent()}
    </Modal>
  );
}

PhoneUpsellModalContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  origin: PropTypes.string,
  existingPhoneNumber: PropTypes.string,
  addPhoneAlwaysShowLegalText: PropTypes.bool,
  addPhoneRequireLegalTextCheckbox: PropTypes.bool,
  addPhoneHeadingKey: PropTypes.string,
  addPhoneDescriptionKey: PropTypes.string,
  addPhoneLegalTextKey: PropTypes.string,
  addPhoneButtonKey: PropTypes.string,
  beforeSuccess: PropTypes.func,
  renderInWebview: PropTypes.bool
};

PhoneUpsellModalContainer.defaultProps = {
  origin: originValues.homepage, // homepage is default origin
  existingPhoneNumber: null, // default is user doesn't have phone number added yet
  addPhoneAlwaysShowLegalText: undefined, // default is set in AddPhoneNumber.jsx
  addPhoneRequireLegalTextCheckbox: undefined,
  addPhoneHeadingKey: undefined,
  addPhoneDescriptionKey: undefined,
  addPhoneLegalTextKey: undefined,
  addPhoneButtonKey: undefined,
  beforeSuccess: null,
  renderInWebview: false
};

export default PhoneUpsellModalContainer;
