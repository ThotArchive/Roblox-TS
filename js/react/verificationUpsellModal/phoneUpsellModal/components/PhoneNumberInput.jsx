import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { phoneUpsellStrings } from '../../common/constants/translationConstants';
import { getPhonePrefixes } from '../services/phoneService';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import { SET_COUNTRY, SET_PHONE_NUMBER, SET_PREFIX_OPTIONS_LIST } from '../actions/actionTypes';
import { phoneSubmissionConstants, phoneNumberA11yInputLabels } from '../constants/phoneConstants';
import getSectionValueForPage from '../utils/loggingUtils';
import events from '../constants/phoneVerificationEventStreamConstants';
import { sendVerificationUpsellEvent } from '../../common/utils/loggingUtils';

function PhoneNumberInput({ translate }) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const { prefixStr, optionStr } = phoneSubmissionConstants;
  const {
    phone,
    phonePrefixPickerIndex,
    phonePrefixOptionsList,
    pageName,
    origin
  } = phoneUpsellState;
  const { PhoneNumberInputId } = phoneNumberA11yInputLabels;

  const section = getSectionValueForPage(pageName);

  useEffect(() => {
    async function populatePhonephonePrefixOptionsList() {
      let options = phonePrefixOptionsList;
      if (phonePrefixOptionsList.length === 0) {
        options = await getPhonePrefixes();
        dispatch({
          type: SET_PREFIX_OPTIONS_LIST,
          phonePrefixOptionsList: options
        });
      }
    }
    populatePhonephonePrefixOptionsList();
  }, []);

  const handlePickPhonePrefix = e => {
    const selectedRowIndex = e.target.value;
    dispatch({
      type: SET_COUNTRY,
      phonePrefixPickerIndex: selectedRowIndex
    });
  };
  const prefix = phonePrefixOptionsList?.[phonePrefixPickerIndex]?.prefix ?? '';

  const handlePhonePrefixFocus = () => {
    sendVerificationUpsellEvent(events.addPhonePrefixPressed, {
      origin,
      section
    });
  };

  const handlePhoneNumberInputFocus = () => {
    sendVerificationUpsellEvent(events.addPhonePhoneNumberPressed, {
      origin,
      section
    });
  };

  return (
    <div>
      <label htmlFor={PhoneNumberInputId}>
        <p className='verification-code-label font-caption-header text-primary'>
          {translate(phoneUpsellStrings.LabelPhoneNumber)}
        </p>
      </label>
      <div id='upsell-phone' className='phone-number-input-container input-field form-control'>
        <div id='upsell-phonenumber' className='phone-input-row'>
          <span className='phone-prefix-wrapper'>
            <div className='phone-prefix-selected text'>{prefixStr(prefix)}</div>
            <select
              className='phone-prefix-dropdown input-field rbx-select'
              onChange={e => handlePickPhonePrefix(e)}
              onFocus={handlePhonePrefixFocus}
              value={phonePrefixPickerIndex}>
              {phonePrefixOptionsList.map((option, key) => (
                <option className='prefix-option' value={key}>
                  {optionStr(option.localizedName, option.prefix)}
                </option>
              ))}
            </select>
          </span>
          <div id='upsell-phonenumber-divider' className='phone-divider' />
          <input
            id={PhoneNumberInputId}
            type='tel'
            value={phone}
            className='phone-input form-control'
            placeholder={translate(phoneUpsellStrings.LabelPhoneNumber)}
            autoComplete='tel-national'
            onChange={event =>
              dispatch({
                type: SET_PHONE_NUMBER,
                phone: event.target.value
              })
            }
            onFocus={handlePhoneNumberInputFocus}
          />
        </div>
      </div>
    </div>
  );
}

PhoneNumberInput.propTypes = {
  translate: PropTypes.func.isRequired
};

export default PhoneNumberInput;
