import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupFormStrings } from '../constants/signupConstants';
import { signupTranslationConfig } from '../translation.config';
import '../../../../css/landing/signup.scss';

export type vpcSignupHeaderProps = {
  translate: WithTranslationsProps['translate'];
};

const SignupFormHeader = ({ translate }: vpcSignupHeaderProps): JSX.Element => {
  return (
    <div className='text-center'>
      <h1 className='vpc-sign-header'>{translate(signupFormStrings.FinishAccountCreation)}</h1>
      <span className='vpc-signup-header-enter-birthday font-body text'>
        {translate(signupFormStrings.SelectBirthdate)}
      </span>
    </div>
  );
};

export default withTranslations(SignupFormHeader, signupTranslationConfig);
