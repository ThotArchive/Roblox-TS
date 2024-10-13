enum ParentalRequestErrorReason {
  Unknown = 'Unknown',
  InvalidUserID = 'InvalidUserID',
  InvalidParameter = 'InvalidParameter',
  ServiceUnavailable = 'ServiceUnavailable',
  NoLinkedParents = 'NoLinkedParents',
  ConsentAlreadyApplied = 'ConsentAlreadyApplied',
  SenderFlooded = 'SenderFlooded',
  ReceiverFlooded = 'ReceiverFlooded',
  SenderFloodedRequestCreated = 'SenderFloodedRequestCreated',
  IllegalState = 'IllegalState',
  InvalidEmailAddress = 'InvalidEmailAddress',
  EmailNotUnique = 'EmailNotUnique',
  LinkingIneligible = 'LinkingIneligible',
  AlreadyLinked = 'AlreadyLinked',
  ChildAtLinkLimit = 'ChildAtLinkLimit',
  ParentAtLinkLimit = 'ParentAtLinkLimit',
  UpdateUserSettingRequestInvalid = 'UpdateUserSettingRequestInvalid',
  ConsentAlreadyRequestedConflictingData = 'ConsentAlreadyRequestedConflictingData',
  ReceiverNotWhitelisted = 'ReceiverNotWhitelisted',
  InvalidComplianceFeature = 'InvalidComplianceFeature',
  ChildTooOld = 'ChildTooOld',
  UserForgotten = 'UserForgotten'
}
export default ParentalRequestErrorReason;
