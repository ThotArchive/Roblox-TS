import {
  passwordValidatorErrorMessages,
  weakPasswords
} from '../constants/passwordValidatorConstants';

function isPasswordBadLength(pwd) {
  return pwd.length < 8 || pwd.length > 200;
}

function isPasswordSameAsUsername(pwd, username) {
  return pwd === username;
}

function isPasswordWeak(pwd) {
  const password = pwd.toLowerCase();
  for (let i = 0; i < weakPasswords.length; i++) {
    if (password === weakPasswords[i]) {
      return true;
    }
  }
  if (/^[\s]*$/.test(password)) {
    // if the password only contains whitespace characters, consider it weak
    return true;
  }
  return false;
}

function getInvalidPasswordMessage(password, username) {
  if (isPasswordBadLength(password)) {
    return passwordValidatorErrorMessages.PasswordBadLength;
  }
  if (isPasswordSameAsUsername(password, username)) {
    return passwordValidatorErrorMessages.PasswordContainsUsernameError;
  }
  if (isPasswordWeak(password)) {
    return passwordValidatorErrorMessages.PasswordComplexity;
  }
  return '';
}

export { getInvalidPasswordMessage as default };
