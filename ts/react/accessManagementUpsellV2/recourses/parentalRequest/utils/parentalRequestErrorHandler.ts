import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';
import parentalRequestConstants from '../constants/parentalRequestConstants';

export interface ParentalRequestError {
  data: {
    code: string;
    sessionId?: string;
  };
}
const { gatherParentEmail } = parentalRequestConstants.translationKeys;
const parentalRequestInlineErrorHandler = (errorReason: ParentalRequestErrorReason): string => {
  switch (errorReason) {
    case ParentalRequestErrorReason.ChildAtLinkLimit:
      return gatherParentEmail.childTooManyParentsError;
    case ParentalRequestErrorReason.ParentAtLinkLimit:
      return gatherParentEmail.emailTooManyChildrenError;
    case ParentalRequestErrorReason.SenderFlooded:
    case ParentalRequestErrorReason.ReceiverFlooded:
      return gatherParentEmail.emailTooManyRequest;
    case ParentalRequestErrorReason.ConsentAlreadyApplied:
    case ParentalRequestErrorReason.AlreadyLinked:
      return gatherParentEmail.body;
    case ParentalRequestErrorReason.InvalidEmailAddress:
      return gatherParentEmail.invalidEmailError;
    default:
      return gatherParentEmail.unknownError;
  }
};

export default parentalRequestInlineErrorHandler;
