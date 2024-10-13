import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import emailSubmissionErrorConstants from '../constants/emailSubmissionErrorConstants';

const {
  MessageInvalidEmailAddress,
  ResponseTooManyAttemptsTryAgainLater,
  ResponseErrorTryAgain
} = verificationUpsellConstants;

const { InvalidEmailCode, Flooded } = emailSubmissionErrorConstants;
// eslint-disable-next-line import/prefer-default-export
export const getErrorMessageFromEmailSubmissionErrorCode = errorCode => {
  switch (errorCode) {
    case Flooded:
      return ResponseTooManyAttemptsTryAgainLater;
    case InvalidEmailCode:
      return MessageInvalidEmailAddress;
    default:
      return ResponseErrorTryAgain;
  }
};
