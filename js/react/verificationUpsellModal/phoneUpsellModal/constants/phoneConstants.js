export const phoneSubmissionConstants = {
  minimumPhoneLength: 4,
  underscore: '_',
  fallbackDefaultCountryCode: 'US',
  unitedStatesPrefix: {
    name: 'United States',
    localizedName: 'United States',
    code: 'US',
    prefix: 1
  },
  prefixStr: prefix => `+${prefix}`,
  optionStr: (localizedName, prefix) => `${localizedName} +(${prefix})`,
  phoneNumberToShowStr: (prefix, phone) => `\n+${prefix}${phone}`,
  Enter: 'Enter',
  CountdownFormatStart: ' (',
  CountdownFormatEnd: ')',
  CodeLength: 6,
  ResendCountdownDuration: 10,
  PhoneShortCodeCountryCode: 'US'
};

export const phoneNumberSubmissionErrorCodes = {
  InvalidPhoneNumber: 2,
  PhoneNumberAlreadyLinkedCode: 3,
  TooManySubmissionAttemptsCode: 6,
  InvalidPhoneNumberType: 8,
  TooManyAssociatedAccounts: 9
};

export const verificationCodeSubmissionErrorCodes = {
  InvalidPhoneNumber: 2, // note that there is a distinct error code for invalid phone versus invalid verification code.
  InvalidCode: 7,
  TooManyVerificationAttemptsCode: 6
};

export const phoneNumberA11yInputLabels = {
  PhoneNumberInputId: 'upsell-phone-number-number',
  VerificationCodeInputId: 'verification-code-input'
};
