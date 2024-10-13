import React from 'react';
import { Intl } from 'Roblox';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import { TBirthdaySelect, FormFieldStatus } from '../../common/types/signupTypes';
import { signupFormStrings } from '../constants/signupConstants';
import { isVerifiedParentConsentSignup } from '../utils/signupUtils';

export type birthdayPickerProps = {
  birthdayStatus: FormFieldStatus;
  orderedBirthdaySelects: Array<TBirthdaySelect>;
  birthdayErrorMessage: string;
  isBirthdayDisabled: boolean;
  translate: WithTranslationsProps['translate'];
};

// VPC signup
const isVPCSignup = isVerifiedParentConsentSignup();

const birthdaySelectOption = (
  value: string,
  label: string,
  type: string,
  translate: WithTranslationsProps['translate']
): JSX.Element => {
  const intl = new Intl();
  let translatedLabel;
  // for certain locales, the year and day strings contain labels following the number that need to be translated
  switch (type) {
    case 'month':
      translatedLabel = translate(label);
      break;
    case 'year':
      translatedLabel = intl.getFormattedDateString(label, translate(signupFormStrings.Year));
      break;
    case 'day':
      translatedLabel = intl.getFormattedDateString(label, translate(signupFormStrings.Day));
      break;
    default:
      translatedLabel = '';
  }
  return <option value={value}>{translatedLabel}</option>;
};

const birthdaySelect = (
  part: TBirthdaySelect,
  disabled: boolean,
  translate: WithTranslationsProps['translate']
): JSX.Element => (
  <div className={`${part.className} rbx-select-group`}>
    <select
      className='rbx-select'
      id={part.idName}
      name={part.birthdayName}
      disabled={disabled}
      value={part.value}
      onChange={e => part.onChange(e)}
      onFocus={part.onFocus}
      onBlur={part.onBlur}
      ref={part.ref}>
      <option value='' disabled selected>
        {translate(part.placeholder)}
      </option>
      {part.options.map(dateOption =>
        birthdaySelectOption(dateOption.value, dateOption.label, part.className, translate)
      )}
    </select>
  </div>
);

const BirthdayPicker = ({
  orderedBirthdaySelects,
  birthdayStatus,
  birthdayErrorMessage,
  isBirthdayDisabled,
  translate
}: birthdayPickerProps): JSX.Element => {
  return (
    <div className='birthday-container'>
      <div
        className={`${birthdayStatus === FormFieldStatus.Valid ? 'has-success' : ''} ${
          birthdayStatus === FormFieldStatus.Invalid ? 'has-error' : ''
        } form-group`}>
        <label htmlFor='landing-birthday' className='font-caption-header'>
          {translate(isVPCSignup ? signupFormStrings.BirthdayRequired : signupFormStrings.Birthday)}
        </label>
        <div className='form-control birthday-select-group'>
          {orderedBirthdaySelects.map(part => birthdaySelect(part, isBirthdayDisabled, translate))}
        </div>
        <div>
          <p
            id='signup-BirthdayInputValidation'
            className='form-control-label font-caption-body input-validation text-error'
            aria-live='polite'>
            {birthdayErrorMessage ? translate(birthdayErrorMessage) : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(BirthdayPicker, signupTranslationConfig);
