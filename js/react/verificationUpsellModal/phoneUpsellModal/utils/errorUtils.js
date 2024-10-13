import {
  phoneNumberSubmissionErrorCodes,
  verificationCodeSubmissionErrorCodes
} from '../constants/phoneConstants';

import { phoneUpsellStrings } from '../../common/constants/translationConstants';

const {
  ResponsePhoneNumberAlreadyLinked,
  ResponseTooManyVerificationAttempts,
  ResponseErrorPhoneFormatInvalid,
  ResponseInvalidPhoneNumberError,
  ResponseErrorTryAgain,
  ResponsePhoneHasTooManyAssociatedAccounts,
  MessageInvalidSmsCode
} = phoneUpsellStrings;

const {
  PhoneNumberAlreadyLinkedCode,
  TooManySubmissionAttemptsCode,
  TooManyAssociatedAccounts,
  InvalidPhoneNumber,
  InvalidPhoneNumberType
} = phoneNumberSubmissionErrorCodes;

const { InvalidCode, TooManyVerificationAttemptsCode } = verificationCodeSubmissionErrorCodes;

export const getErrorMessageFromSubmissionErrorCode = errorCode => {
  switch (errorCode) {
    case PhoneNumberAlreadyLinkedCode:
      return ResponsePhoneNumberAlreadyLinked;
    case TooManySubmissionAttemptsCode:
      return ResponseTooManyVerificationAttempts;
    case InvalidPhoneNumber:
      return ResponseErrorPhoneFormatInvalid;
    case InvalidPhoneNumberType:
      return ResponseInvalidPhoneNumberError;
    case TooManyAssociatedAccounts:
      return ResponsePhoneHasTooManyAssociatedAccounts;
    default:
      return ResponseErrorTryAgain;
  }
};

export const getErrorMessageFromVerificationErrorCode = errorCode => {
  switch (errorCode) {
    case TooManyVerificationAttemptsCode:
      return ResponseTooManyVerificationAttempts;
    case InvalidCode:
      return MessageInvalidSmsCode;
    default:
      return ResponseErrorTryAgain;
  }
};
