import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';
import parentalRequestConstants from '../constants/parentalRequestConstants';

export interface ParentalRequestError {
  data: {
    code: string;
    sessionId?: string;
  };
}

export const defaultParentalRequestError: ParentalRequestError = {
  data: {
    code: 'UnknownError'
  }
};
const { gatherParentEmail } = parentalRequestConstants.translationKeys;
const parentalRequestInlineErrorHandler = (errorReason: ParentalRequestErrorReason): string => {
  switch (errorReason) {
    case ParentalRequestErrorReason.ChildAtLinkLimit:
      return gatherParentEmail.childTooManyParentsError;
    case ParentalRequestErrorReason.ParentAtLinkLimit:
      return gatherParentEmail.emailTooManyChildrenError;
    case ParentalRequestErrorReason.SenderFlooded:
      return gatherParentEmail.senderFlooded;
    case ParentalRequestErrorReason.ReceiverFlooded:
      return gatherParentEmail.emailTooManyRequest;
    case ParentalRequestErrorReason.ConsentAlreadyApplied:
      return gatherParentEmail.alreadyApplied;
    case ParentalRequestErrorReason.AlreadyLinked:
      return gatherParentEmail.alreadyLinked;
    case ParentalRequestErrorReason.InvalidEmailAddress:
      return gatherParentEmail.invalidEmailError;
    default:
      return gatherParentEmail.unknownError;
  }
};

export default parentalRequestInlineErrorHandler;
