export const TRANSLATION_KEYS = {
  AvailableCreditLabel: 'Label.AvailableCreditWithColon',
  BalanceDueLabel: 'Label.BalanceDue',
  CreditAfterTransaction: 'Label.CreditAfterTransaction',

  LargeCreditBalanceTooltipMessage: 'Message.LargeCreditBalanceTooltip',

  GetRobuxAction: 'Action.GetRobux',
  GetPremiumAction: 'ActionsGetPremium', // From CommonUI.Features
  ConvertCreditToRobuxAction: 'Label.ConvertCreditSuccess',

  BuyAction: 'Action.Buy',
  CancelAction: 'Action.Cancel',
  ConvertToRobuxAction: 'Action.ConvertToRobux',

  ConvertCreditToRobuxModalHeading: 'Label.ConvertCreditSuccess',
  BuyRobuxWithCreditModalHeading: 'Heading.BuyRobuxWithCredit',
  LargestPackageYouCanBuyStep1Message: 'Message.Step1LargestAvailablePackageYouCanBuy',
  NextLargestPackageStep2Message: 'Message.Step2NextLargestPackage',
  ConvertToRobuxStep3Message: 'Message.Step3ConvertRobux',
  ConvertCreditToRobuxMessage: 'Message.ConvertCreditToRobux',

  RobuxPackagePurchasedSuccessAlert: 'Alert.RobuxPackagePurchased',
  RobuxPackagePurchasedFailedAlert: 'Alert.RobuxPackagePurchaseFailed',
  ConvertedCreditToRobuxSuccessAlert: 'Alert.SuccessfullyConvertedCreditToRobux',
  ConvertedCreditToRobuxFailedAlert: 'Heading.CreditConversionFail',
  GenericFailureAlert: 'Alert.GenericFailure',

  CreditConversionHeading: 'Heading.CreditConversion',
  CreditConversionDesription: 'Description.CreditConversion',
  CodeValueLabel: 'Label.CodeValue',
  ConversionLabel: 'Label.Conversion',
  ContinueAction: `Action.Continue`,
  CodeNotYetRedeemedHeading: 'Heading.CodeNotYetRedeemed',
  CodeNotYetRedeemedMessage: 'Message.CodeNotYetRedeemed',
  OkAction: 'Action.Ok',
  CreditConversionConfirmation: 'Message.CreditConversionConfirmation'
};

export const PREMIUM_PAGE_PATH = '/premium/membership';

export const CREDIT_PAYMENT_PROVIDER_TYPE = 'Credit';

export const giftCardTermsURL = 'http://www.roblox.com/giftcardterms';

export const COUNTER_METRICS = {
  GET_NEXT_PURCHASABLE_FAILED_STATUS_CODE_PREFIX:
    'NewCreditConversionGetNextPurchasableFailedStatusCode',
  GET_NEXT_PURCHASABLE_CREDIT_BALANCE_ZERO:
    'NewCreditConversionGetNextPurchasableCreditBalanceZero',
  GET_NEXT_PURCHASABLE_UNEXPECTED_EXCEPTION:
    'NewCreditConversionGetNextPurchasableUnexpectedException',
  GET_NEXT_PURCHASABLE_CONVERSION: 'NewCreditConversionGetNextPurchasableConversion',
  GET_NEXT_PURCHASABLE_PRODUCT_PURCHASE: 'NewCreditConversionGetNextPurchasableProductPurchase',
  PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX: 'ProcessPaymentRequestFailedStatusCode',
  PROCESS_PAYMENT_NEXT_STEP: 'ProcessPaymentNextStep',
  PROCESS_PAYMENT_NOT_SUCCESSFUL_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_RESPONSE_MESSAGE_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_UNEXPECTED_EXCEPTION: 'ProcessPaymentUnexpectedException',
  GO_TO_PREMIUM: 'GoToPremium',
  CONVERSION_CANCEL_CLICKED: 'ConversionCancelClicked',
  PRODUCT_PURCHASE_CANCEL_CLICKED: 'ProductPurchaseCancelClicked',
  GET_CONVERSION_METADATA_FAILED_PREFIX: 'GetConversionMetadataFailed',
  CREDIT_CONVERSION_CONTINUE_CLICKED: 'CreditConversionContinueClicked',
  CREDIT_CONVERSION_CANCEL_CLICKED: 'CreditConversionCancelClick'
};
