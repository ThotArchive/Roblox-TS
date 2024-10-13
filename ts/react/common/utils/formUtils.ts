import { emailRegex, minimumPhoneLength } from '../constants/formConstants';

export const isValidEmail = (email: string): boolean => {
  const re = new RegExp(emailRegex);
  return re.test(email);
};

// util function taken from Roblox.AccountSettings.WebApp/js/angular/phoneValidation/services/phoneService.js
export const isPhoneNumber = (input: string): boolean => {
  if (!input || input.length < minimumPhoneLength) {
    return false;
  }

  // input must contain at least one digit
  if (!/\d/.test(input)) {
    return false;
  }

  // input may only contain digits and special characters (including underscore)
  return /^[\d|\W|_]+$/.test(input);
};
