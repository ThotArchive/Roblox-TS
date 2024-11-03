import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import {
  phoneUpsellStrings,
  phoneUpsellStringLinkConstants
} from '../../common/constants/translationConstants';
import { phoneSubmissionConstants } from '../constants/phoneConstants';
import {
  getErrorEventWithErrorCodeParam,
  sendVerificationUpsellEvent
} from '../../common/utils/loggingUtils';
import getErrorCodeFromRequestError from '../../common/utils/requestUtils';
import { SET_ERROR_MESSAGE, SET_PAGE } from '../actions/actionTypes';
import { VERIFY_PHONE_NUMBER_PAGE, DELETE_PHONE_CONFIRM_PAGE } from '../constants/pageConstants';
import events from '../constants/phoneVerificationEventStreamConstants';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import { setPhoneNumber } from '../services/phoneService';
import { getErrorMessageFromSubmissionErrorCode } from '../utils/errorUtils';
import getSectionValueForPage from '../utils/loggingUtils';
import InputFieldError from './InputFieldError';
import PhoneNumberInput from './PhoneNumberInput';

const {
  ActionAddPhoneNumber,
  ActionContinue,
  DescriptionVerificationCodeSmsFeesMayApply,
  DescriptionPhoneNumberNeverPublic,
  DescriptionShortCodeLegalDisclaimer,
  LabelCurrentNumber,
  DescriptionEditPhoneWarning,
  ActionEditPhonePrimary,
  ActionEditPhoneSecondary
} = phoneUpsellStrings;

const {
  linkTagEnd,
  linkTagWithPrivacyPolicy,
  linkTagWithSmsTos,
  linkTagBreak
} = phoneUpsellStringLinkConstants;

function AddPhoneNumber({
  translate,
  onHide,
  existingPhoneNumber,
  alwaysShowLegalText,
  requireLegalTextCheckbox,
  headingKey,
  descriptionKey,
  legalTextKey,
  buttonKey
}) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const {
    phone,
    phonePrefixPickerIndex,
    phonePrefixOptionsList,
    pageName,
    origin
  } = phoneUpsellState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldHideShortCodeDisclaimer, setShouldHideShortCodeDisclaimer] = useState(false);
  const [isLegalChecked, setIsLegalChecked] = useState(false);
  const section = getSectionValueForPage(pageName);

  useEffect(() => {
    const countryCode = phonePrefixOptionsList?.[phonePrefixPickerIndex]?.code;
    // short codees only apply phone numbers from the USA
    setShouldHideShortCodeDisclaimer(
      !alwaysShowLegalText && countryCode !== phoneSubmissionConstants.PhoneShortCodeCountryCode
    );
  }, [alwaysShowLegalText, phonePrefixOptionsList, phonePrefixPickerIndex]);

  const shortCodeDisclaimerHtml = translate(legalTextKey, {
    linkTagWithSmsTos,
    linkTagWithPrivacyPolicy,
    linkTagEnd,
    linkTagBreak
  });
  const handleContinueClick = async () => {
    setIsSubmitting(true);
    const { prefix, code } = phonePrefixOptionsList[phonePrefixPickerIndex];
    sendVerificationUpsellEvent(events.addPhoneContinuePressed, {
      origin,
      section
    });
    await setPhoneNumber({ phone, prefix, countryCode: code })
      .then(() => {
        // TODO: add loading UI
        dispatch({ type: SET_PAGE, pageName: VERIFY_PHONE_NUMBER_PAGE });
      })
      .catch(err => {
        const errorCode = getErrorCodeFromRequestError(err);
        const errorEvent = getErrorEventWithErrorCodeParam(
          events.phoneNumberModalErrorShown,
          errorCode
        );
        sendVerificationUpsellEvent(errorEvent, {
          origin,
          section
        });
        dispatch({
          type: SET_ERROR_MESSAGE,
          errorMessage: getErrorMessageFromSubmissionErrorCode(errorCode)
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='verification-upsell-title-container'>
          <Modal.Title id='verification-upsell-modal-title'>
            {existingPhoneNumber ? translate(ActionEditPhonePrimary) : translate(headingKey)}
          </Modal.Title>
        </div>
        <button type='button' className='close close-button' onClick={onHide}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className='phone-number-submission-container'>
          <div className='verification-upsell-text-body text-description'>
            {translate(descriptionKey)}
          </div>
          {/* Edit Phone Number Info */}
          {existingPhoneNumber && (
            <React.Fragment>
              <div className='verification-upsell-text-body text-description'>
                {translate(LabelCurrentNumber)}
                &nbsp;
                {existingPhoneNumber}
              </div>
              <div className='border-warning two-step-warning'>
                <span className='icon-warning-orange' />
                <span className='small text-warning form-warning-text'>
                  {translate(DescriptionEditPhoneWarning)}
                </span>
              </div>
            </React.Fragment>
          )}
          <PhoneNumberInput translate={translate} />
          <div className='phone-verification-nonpublic-text text-description font-caption-body'>
            {translate(DescriptionPhoneNumberNeverPublic)}
          </div>
          <InputFieldError translate={translate} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {requireLegalTextCheckbox ? (
          <div className='phone-verification-legal-container checkbox'>
            <input
              id='phone-verification-legal-checkbox'
              className='checkbox'
              type='checkbox'
              checked={isLegalChecked}
              onChange={() => setIsLegalChecked(!isLegalChecked)}
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              className='text-description font-caption-body phone-verification-legal-text'
              hidden={shouldHideShortCodeDisclaimer}
              htmlFor='phone-verification-legal-checkbox'
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: shortCodeDisclaimerHtml
              }}
            />
          </div>
        ) : (
          <div
            className='text-description font-caption-body phone-verification-legal-text'
            hidden={shouldHideShortCodeDisclaimer}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: shortCodeDisclaimerHtml
            }}
          />
        )}
        <div className='buttons-section'>
          <Button
            type='button'
            id='add-phone-number-continue-button'
            className='accept-btn'
            variant={Button.variants.primary}
            isDisabled={
              isSubmitting || phone.length === 0 || (requireLegalTextCheckbox && !isLegalChecked)
            }
            onClick={() => handleContinueClick()}>
            {translate(buttonKey)}
          </Button>
        </div>
        <div>
          {/* Delete Phone Number Button */}
          {existingPhoneNumber && (
            <span
              className='text-report remove-phone-label'
              onClick={() => dispatch({ type: SET_PAGE, pageName: DELETE_PHONE_CONFIRM_PAGE })}
              onKeyDown={() => dispatch({ type: SET_PAGE, pageName: DELETE_PHONE_CONFIRM_PAGE })}
              role='button'
              tabIndex={0}>
              {translate(ActionEditPhoneSecondary)}
            </span>
          )}
        </div>
      </Modal.Footer>
    </div>
  );
}

AddPhoneNumber.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  existingPhoneNumber: PropTypes.string,
  alwaysShowLegalText: PropTypes.bool,
  requireLegalTextCheckbox: PropTypes.bool,
  headingKey: PropTypes.string,
  descriptionKey: PropTypes.string,
  legalTextKey: PropTypes.string,
  buttonKey: PropTypes.string
};

AddPhoneNumber.defaultProps = {
  existingPhoneNumber: null, // default is user doesn't have phone number added yet
  alwaysShowLegalText: false,
  requireLegalTextCheckbox: false,
  headingKey: ActionAddPhoneNumber,
  descriptionKey: DescriptionVerificationCodeSmsFeesMayApply,
  legalTextKey: DescriptionShortCodeLegalDisclaimer,
  buttonKey: ActionContinue
};

export default AddPhoneNumber;
