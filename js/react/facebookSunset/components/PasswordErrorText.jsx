import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { passwordTranslation } from '../app.config';

function PasswordErrorText({ passwordError, translate }) {
  return (
    <p className='text-error modal-error-message password-error'>{translate(passwordError)}</p>
  );
}

PasswordErrorText.propTypes = {
  translate: PropTypes.func.isRequired,
  passwordError: PropTypes.string.isRequired
};

export default withTranslations(PasswordErrorText, passwordTranslation);
