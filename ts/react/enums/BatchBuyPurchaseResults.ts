enum BatchBuyPurchaseResults {
  Success = 'Success',
  AlreadyOwned = 'ALREADY_OWNED',
  InsufficientFunds = 'INSUFFICIENT_ROBUX',
  ExceptionOccured = 'INTERNAL',
  TooManyPurchases = 'QUOTA_EXCEEDED',
  CaughtError = 'CaughtError',
  PremiumNeeded = 'INSUFFICIENT_MEMBERSHIP',
  NoSellers = 'NOT_FOR_SALE',
  TwoStepVerificationRequired = 'TwoStepVerificationRequired',
  InExperienceOnly = 'PURCHASE_PLACE_INVALID'
}

export default BatchBuyPurchaseResults;
