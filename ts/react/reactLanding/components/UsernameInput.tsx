import React from 'react';
import { withTranslations, WithTranslationsProps, useDebounce } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import { signupFormStrings } from '../constants/signupConstants';
import { FormFieldStatus } from '../../common/types/signupTypes';
import { sendUsernameFocusEvent, sendUsernameOffFocusEvent } from '../services/eventService';
import UsernameSuggestionContainer from './UsernameSuggestionContainer';

export type usernameInputProps = {
  username: string;
  usernameStatus: FormFieldStatus;
  handleUsernameChange: (username: string) => void;
  usernameErrorMessage: string;
  disabled: boolean;
  isEligibleForUsernameSuggestion: boolean;
  birthday: Date;
  usernameRef: React.RefObject<HTMLInputElement>;
  handleKeyStroke: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  translate: WithTranslationsProps['translate'];
};

const UsernameInput = ({
  username,
  handleUsernameChange,
  usernameStatus,
  usernameErrorMessage,
  disabled,
  isEligibleForUsernameSuggestion,
  birthday,
  usernameRef,
  handleKeyStroke,
  translate
}: usernameInputProps): JSX.Element => {
  const debouncedUsername = useDebounce(username, 200); // 200 ms debounce

  return (
    <div
      className={`${usernameStatus === FormFieldStatus.Valid ? 'has-success' : ''} ${
        usernameStatus === FormFieldStatus.Invalid ? 'has-error' : ''
      } form-group`}>
      <label htmlFor='landing-username' className='font-caption-header'>
        {translate(signupFormStrings.Username)}
      </label>
      <input
        id='signup-username'
        name='signupUsername'
        className='form-control font-body text input-field'
        type='text'
        autoComplete='signup-username'
        placeholder={translate(signupFormStrings.UsernamePlaceholder)}
        value={username}
        onChange={e => handleUsernameChange(e.target.value)}
        onFocus={sendUsernameFocusEvent}
        onBlur={sendUsernameOffFocusEvent}
        onKeyUp={e => handleKeyStroke(e)}
        onKeyDown={e => handleKeyStroke(e)}
        disabled={disabled}
        ref={usernameRef}
      />
      <p
        id='signup-usernameInputValidation'
        className='form-control-label font-caption-body input-validation text-error'
        aria-live='polite'>
        {usernameErrorMessage ? translate(usernameErrorMessage) : ''}
      </p>
      {isEligibleForUsernameSuggestion && (
        <UsernameSuggestionContainer
          inputUsername={debouncedUsername}
          birthday={birthday}
          translate={translate}
          onUsernameClicked={handleUsernameChange}
        />
      )}
    </div>
  );
};

export default withTranslations(UsernameInput, signupTranslationConfig);
