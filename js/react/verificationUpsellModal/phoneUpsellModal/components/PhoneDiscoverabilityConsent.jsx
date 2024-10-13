import { eventStreamService } from 'core-roblox-utilities';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import {
  phoneDiscoverabilityConsentPageStrings,
  phoneUpsellStrings
} from '../../common/constants/translationConstants';
import { SET_ERROR_MESSAGE } from '../actions/actionTypes';
import {
  phoneDiscoverabilityConsentHelpUrl,
  phoneDiscoverabilityEventTypes,
  phoneDiscoverabilityOptions,
  phoneVerificationUpsell
} from '../constants/phoneDiscoverabilityConsentConstants';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import { setPhoneDiscoverabilityConsent } from '../services/phoneDiscoverabilityConsentService';
import { getVersionName } from '../utils/phoneDiscoverabilityLoggingUtils';
import InputFieldError from './InputFieldError';

function PhoneDiscoverabilityConsent({
  translate,
  shouldPrefillAffirmativeDiscoverabilityConsent,
  origin,
  onHide,
  headingKey,
  descriptionKey
}) {
  const { dispatch } = usePhoneUpsellState();
  const {
    ActionDone,
    ActionLearnMore,
    DescriptionPhoneDiscoverabilityPrivacy,
    DescriptionWantToBeRecommendedViaPhone,
    HeaderLetFriendsFindYou,
    LabelNo,
    LabelYes,
    ResponseErrorTryAgain
  } = phoneDiscoverabilityConsentPageStrings;

  const {
    discoverabilityPageLoad,
    discoverabilityPageClick,
    discoverabilityPageRadioButtonClick
  } = phoneDiscoverabilityEventTypes;

  const [consentSelection, setConsentSelection] = useState(
    shouldPrefillAffirmativeDiscoverabilityConsent
      ? phoneDiscoverabilityOptions.Discoverable
      : phoneDiscoverabilityOptions.Unset
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRadioButtonClick = e => {
    setConsentSelection(e.currentTarget.value);
    eventStreamService.sendEventWithTarget(
      discoverabilityPageRadioButtonClick,
      e.currentTarget.value,
      { origin }
    );
  };

  const handleDoneClick = () => {
    setIsSubmitting(true);
    eventStreamService.sendEventWithTarget(discoverabilityPageClick, consentSelection, { origin });
    setPhoneDiscoverabilityConsent(consentSelection).then(isSuccessful => {
      if (isSuccessful !== true) {
        setIsSubmitting(false);
        dispatch({
          type: SET_ERROR_MESSAGE,
          errorMessage: ResponseErrorTryAgain
        });
        return;
      }
      dispatch({
        type: SET_ERROR_MESSAGE,
        errorMessage: ''
      });
      onHide();
    });
  };

  useEffect(() => {
    eventStreamService.sendEventWithTarget(discoverabilityPageLoad, phoneVerificationUpsell, {
      version: getVersionName(shouldPrefillAffirmativeDiscoverabilityConsent),
      origin
    });
  }, []);

  return (
    <div className='phone-discoverability-consent'>
      <Modal.Body className='verification-grid'>
        <span className='icon-spot-success-xl verification-grid-icon' />
        <div className='discoverability-text-section'>
          <div className='verification-upsell-title-container page-title '>
            <Modal.Title>{translate(headingKey)}</Modal.Title>
          </div>
          <div className='text-description'>{translate(descriptionKey)}</div>
        </div>
        <span className='icon-spot-find-friends-xl verification-grid-icon' />
        <div className='discoverability-text-section'>
          <div className='verification-upsell-title-container page-title'>
            <Modal.Title>{translate(HeaderLetFriendsFindYou)}</Modal.Title>
          </div>
          <div className='text-description'>
            {translate(DescriptionWantToBeRecommendedViaPhone)}
          </div>
        </div>
        <div className='verification-grid-icon' />
        <div className='discoverability-radio-button-section'>
          <div className='radio discoverability-consent-option'>
            <input
              type='radio'
              name='discoverability-options'
              id='consent-radio-button'
              value={phoneDiscoverabilityOptions.Discoverable}
              checked={consentSelection === phoneDiscoverabilityOptions.Discoverable}
              onClick={handleRadioButtonClick}
            />
            <label className='text-description' htmlFor='consent-radio-button'>
              {translate(LabelYes)}
            </label>
          </div>
          <div className='radio discoverability-consent-option'>
            <input
              type='radio'
              name='discoverability-options'
              id='no-consent-radio-button'
              value={phoneDiscoverabilityOptions.NotDiscoverable}
              checked={consentSelection === phoneDiscoverabilityOptions.NotDiscoverable}
              onClick={handleRadioButtonClick}
            />
            <label className='text-description' htmlFor='no-consent-radio-button'>
              {translate(LabelNo)}
            </label>
          </div>
        </div>
        <div className='verification-grid-icon' />
        <div>
          <div className='text-secondary'>{translate(DescriptionPhoneDiscoverabilityPrivacy)}</div>
          <a
            className='text-secondary text-link learn-more-link'
            target='_blank'
            rel='noreferrer'
            href={phoneDiscoverabilityConsentHelpUrl}>
            {translate(ActionLearnMore)}
          </a>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <InputFieldError translate={translate} />
        <button
          type='button'
          className='btn-cta-md btn-max-width phone-number-verify-button'
          disabled={isSubmitting}
          onClick={handleDoneClick}>
          {translate(ActionDone)}
        </button>
      </Modal.Footer>
    </div>
  );
}

PhoneDiscoverabilityConsent.propTypes = {
  origin: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  shouldPrefillAffirmativeDiscoverabilityConsent: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  headingKey: PropTypes.string,
  descriptionKey: PropTypes.string
};

PhoneDiscoverabilityConsent.defaultProps = {
  headingKey: phoneUpsellStrings.HeadingPhoneIsVerified,
  descriptionKey: phoneUpsellStrings.DescriptionPhoneForRecovery
};

export default PhoneDiscoverabilityConsent;
