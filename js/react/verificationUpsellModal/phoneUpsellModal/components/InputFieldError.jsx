import React from 'react';
import PropTypes from 'prop-types';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';

function InputFieldError({ translate }) {
  const { phoneUpsellState } = usePhoneUpsellState();
  return (
    <p className='input-field-error-text sms-code-error text-error modal-error-message'>
      {phoneUpsellState.errorMessage ? translate(phoneUpsellState.errorMessage) : null}
    </p>
  );
}

InputFieldError.propTypes = {
  translate: PropTypes.func.isRequired
};

export default InputFieldError;
