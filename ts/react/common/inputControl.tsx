import React from 'react';
import { FormControl, FormGroup } from 'react-style-guide';
import '../../../css/common/inputFieldConcealed.scss';
import { RequestService } from '../../common/request';
import {
  AccountSecurityPromptResources,
  mapPasswordValidationStatusToResource
} from '../accountSecurityPrompt/constants/resources';

/**
 * A helper function that captures [Enter] presses within input elements
 * (especially those that are not bound to forms with submit behavior).
 */
const handleKeyDown = (handler: () => void | Promise<void>, canSubmit: boolean) => async (
  event: React.KeyboardEvent<unknown>
): Promise<void> => {
  // Enter key.
  if (event.key === 'Enter' && canSubmit) {
    event.preventDefault();
    event.stopPropagation();
    await handler();
  }
};

type InputValidator = (value: string) => Promise<string | null>;

/**
 * Returns null (no error) for every argument.
 */
export const validateTrue: InputValidator = () => Promise.resolve(null);

/**
 * Returns null (no error) if the argument is an acceptable password (meets
 * certain requirements and does not match the user's username).
 */
export const validatePassword = (
  requestService: RequestService,
  resources: AccountSecurityPromptResources,
  username: string,
  defaultErrorMessage: string
): InputValidator => async (value: string) => {
  const result = await requestService.password.validate(username, value);
  if (result.isError) {
    return defaultErrorMessage;
  }

  return mapPasswordValidationStatusToResource(resources, result.value);
};

/**
 * Returns null (no error) if the argument looks like an email address.
 */
export const validateEmailAddress = (errorMessage: string): InputValidator => async (
  value: string
) => {
  const re = /\S+@\S+\.\S+/;
  if (re.test(value)) {
    return Promise.resolve(null);
  }

  return Promise.resolve(errorMessage);
};

/**
 * Returns null (no error) if the argument equals some target value.
 */
export const validateEquals = (errorMessage: string, target: string): InputValidator => async (
  value: string
) => {
  if (value === target) {
    return Promise.resolve(null);
  }

  return Promise.resolve(errorMessage);
};

/**
 * Returns null (no error) if all the passed input validators return null for
 * the argument (after being applied in sequence).
 */
export const validateChained = (...inputValidators: InputValidator[]): InputValidator => async (
  value: string
) => {
  for (let i = 0; i < inputValidators.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const errorMessage = await inputValidators[i](value);
    if (errorMessage !== null) {
      return errorMessage;
    }
  }

  return null;
};

/**
 * A helper function that captures form input `onChange` events, validating the
 * input value and setting the appropriate React state variables.
 */
const validateAndSetStateForInput = (
  lastValue: string,
  validCharactersRegEx: RegExp | undefined,
  validate: InputValidator,
  setValue: (value: string) => void,
  setError: (errorMessage: string | null) => void,
  onChangeCustom?: (value: string) => void
) => async (event: React.FormEvent<FormControl & HTMLInputElement>): Promise<void> => {
  let { value } = event.currentTarget;
  // Force the value back to the original value if we got invalid characters.
  if (validCharactersRegEx !== undefined && !validCharactersRegEx.test(value)) {
    value = lastValue;
  }

  if (onChangeCustom !== undefined) {
    onChangeCustom(value);
  }
  setValue(value);
  setError(await validate(value));
};

type Props = {
  // Required parameters:
  id: string;
  inputType: string;
  placeholder: string;
  disabled: boolean;
  value: string;
  setValue: (value: string) => void;
  error: string | null;
  setError: (errorMessage: string | null) => void;
  validate: InputValidator;
  canSubmit: boolean;
  handleSubmit: () => void | Promise<void>;
  /** Additional optional code to run on input change. */
  onChange: (value?: string) => void;

  // Optional parameters:
  // eslint-disable-next-line react/require-default-props
  label?: string;
  // eslint-disable-next-line react/require-default-props
  bottomLabel?: string | JSX.Element;
  // eslint-disable-next-line react/require-default-props
  inputMode?: FormControl.FormControlProps['inputMode'];
  // eslint-disable-next-line react/require-default-props
  autoComplete?: string;
  // eslint-disable-next-line react/require-default-props
  maxLength?: number;
  // eslint-disable-next-line react/require-default-props
  validCharactersRegEx?: RegExp;
  // eslint-disable-next-line react/require-default-props
  hideFeedback?: boolean;
  // eslint-disable-next-line react/require-default-props
  concealInput?: boolean;
  // eslint-disable-next-line react/require-default-props
  autoFocus?: boolean;
};

/**
 * An input control that encapsulates Roblox-styled inputs with labels and
 * error validation.
 *
 * TODO: Allow password inputs to be toggled for visibility.
 */
const InputControl: React.FC<Props> = ({
  id,
  inputType,
  placeholder,
  disabled,
  value,
  error,
  canSubmit,
  validate,
  setValue,
  setError,
  handleSubmit,
  onChange: onChangeCustom,
  label,
  bottomLabel,
  inputMode,
  autoComplete,
  maxLength,
  validCharactersRegEx,
  hideFeedback,
  concealInput,
  autoFocus
}: Props) => {
  const valueHasSuccess = value !== '' && error === null;
  const valueHasError = value !== '' && error !== null;
  const valueHasFeedback = valueHasSuccess || valueHasError;

  return (
    <div className='input-control-wrapper'>
      {label && (
        <label className='text-label xsmall' htmlFor={id}>
          {label}
        </label>
      )}
      <FormGroup
        controlId={id}
        className={`${valueHasFeedback ? 'form-has-feedback' : ''} ${
          valueHasSuccess ? 'form-has-success' : ''
        } ${valueHasError ? 'form-has-error' : ''}`}>
        <FormControl
          as='input'
          className={`input-field${
            concealInput && value.length > 0 ? ' input-field-concealed' : ''
          }`}
          type={inputType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={validateAndSetStateForInput(
            value, // The value prior to change.
            validCharactersRegEx,
            validate,
            setValue,
            setError,
            onChangeCustom
          )}
          onKeyDown={handleKeyDown(handleSubmit, canSubmit)}
          autoFocus={autoFocus}
        />
        {!disabled && !hideFeedback && valueHasSuccess && <span className='icon-checkmark-on' />}
        {!disabled && !hideFeedback && valueHasError && <span className='icon-close' />}
        {/* Prevent reflow of elements when we get an error. */}
        <div className='form-control-label bottom-label xsmall'>
          {!disabled && valueHasError ? error : bottomLabel || '\u00A0'}
        </div>
      </FormGroup>
    </div>
  );
};

export default InputControl;
