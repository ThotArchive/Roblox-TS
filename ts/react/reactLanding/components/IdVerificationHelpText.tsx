import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { idVerificationTranslationConfig } from '../translation.config';
import { signupFormStrings } from '../constants/signupConstants';

const IdVerificationHelpText = ({ translate }: WithTranslationsProps): JSX.Element => {
  return (
    <div className='text font-caption-body signup-korea-parent-hint'>
      {translate(signupFormStrings.KoreaAdultUser)}
    </div>
  );
};

export default withTranslations(IdVerificationHelpText, idVerificationTranslationConfig);
