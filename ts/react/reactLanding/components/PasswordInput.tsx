import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import { signupFormStrings } from '../constants/signupConstants';
import { FormFieldStatus } from '../../common/types/signupTypes';
import { sendPasswordFocusEvent, sendPasswordOffFocusEvent } from '../services/eventService';

export type passwordInputProps = {
  password: string;
  passwordStatus: FormFieldStatus;
  handlePasswordChange: (password: string) => void;
  passwordErrorMessage: string;
  passwordVisibility: boolean;
  handlePasswordVisibilityToggle: () => void;
  disabled: boolean;
  passwordRef: React.RefObject<HTMLInputElement>;
  translate: WithTranslationsProps['translate'];
};

const PasswordInput = ({
  password,
  handlePasswordChange,
  passwordStatus,
  passwordErrorMessage,
  passwordVisibility,
  handlePasswordVisibilityToggle,
  disabled,
  passwordRef,
  translate
}: passwordInputProps): JSX.Element => {
  return (
    <div
      className={`${passwordStatus === FormFieldStatus.Valid ? 'has-success' : ''} ${
        passwordStatus === FormFieldStatus.Invalid ? 'has-error' : ''
      } password-form-group form-group`}>
      <label htmlFor='landing-password' className='font-caption-header'>
        {translate(signupFormStrings.Password)}
      </label>
      <input
        id='signup-password'
        name='signupPassword'
        className='form-control password-with-visibility-toggle font-body text input-field'
        type={passwordVisibility ? 'text' : 'password'}
        autoComplete='new-password'
        placeholder={translate(signupFormStrings.PasswordPlaceholder)}
        value={password}
        onChange={e => handlePasswordChange(e.target.value)}
        onFocus={sendPasswordFocusEvent}
        onBlur={sendPasswordOffFocusEvent}
        ref={passwordRef}
        disabled={disabled}
      />
      {password && (
        // the password visibility toggle does not need to be focusable
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus
        <div
          role='button'
          aria-label='toggle-password-visibility'
          className={`${
            passwordVisibility ? 'icon-password-hide-v2' : 'icon-password-show-v2'
          }  icon-password-show password-visibility-toggle`}
          onClick={() => handlePasswordVisibilityToggle()}
        />
      )}
      <p
        id='signup-passwordInputValidation'
        className='form-control-label font-caption-body input-validation text-error'
        aria-live='polite'>
        {passwordErrorMessage ? translate(passwordErrorMessage) : ''}
      </p>
    </div>
  );
};

export default withTranslations(PasswordInput, signupTranslationConfig);
