import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import { GenderType } from '../../common/types/signupTypes';
import {
  sendMaleGenderFocusEvent,
  sendMaleGenderOffFocusEvent,
  sendFemaleGenderFocusEvent,
  sendFemaleGenderOffFocusEvent
} from '../services/eventService';

export type genderPickerProps = {
  gender: number;
  setSelectedGender: (genderType: GenderType) => void;
  translate: WithTranslationsProps['translate'];
};

const GenderPicker = ({ gender, setSelectedGender, translate }: genderPickerProps): JSX.Element => {
  return (
    <div className='gender-container'>
      <label htmlFor='landing-gender' className='font-caption-header'>
        {translate('Label.OptionalGender')}
      </label>
      <div className='form-group'>
        <div className='form-control fake-input-lg'>
          <button
            type='button'
            id='FemaleButton'
            className='gender-button text-lead'
            title={translate('Label.Female')}
            onClick={e => setSelectedGender(GenderType.female)}
            onFocus={sendFemaleGenderFocusEvent}
            onBlur={sendFemaleGenderOffFocusEvent}>
            <div
              className={`${
                gender === GenderType.female ? 'gender-selected' : ''
              } gender-icon gender-female`}
            />
          </button>
          <button
            type='button'
            id='MaleButton'
            className='gender-button text-lead'
            title={translate('Label.Male')}
            onClick={e => setSelectedGender(GenderType.male)}
            onFocus={sendMaleGenderFocusEvent}
            onBlur={sendMaleGenderOffFocusEvent}>
            <div
              className={`${
                gender === GenderType.male ? 'gender-selected' : ''
              } gender-icon gender-male`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(GenderPicker, signupTranslationConfig);
