export const FeatureLoginPage = {
  ActionSignUpCapitalized: 'Action.SignUpCapitalized',
  ActionLogInCapitalized: 'Action.LogInCapitalized',
  ActionDeviceCode: 'Action.DeviceCode',
  ActionResendEmail: 'Action.ResendEmail',
  ActionSendVerificationEmail: 'Action.SendVerificationEmail',
  ActionOk: 'Action.Ok',
  ActionAnotherLoggedInDevice: 'Action.AnotherLoggedInDevice',
  ActionForgotPasswordOrUsernameQuestionCapitalized:
    'Action.ForgotPasswordOrUsernameQuestionCapitalized',
  ActionLogInEmailOneTimeCode: 'Action.LogInEmailOneTimeCode',
  ActionLogInWithOneTimeCode: 'Action.LogInWithOneTimeCode',
  ActionLogInAnotherDevice: 'Action.LogInAnotherDevice',
  ActionNeedHelp: 'Action.NeedHelp',
  ActionUseAnotherDevice: 'Action.UseAnotherDevice',
  ActionCreateANewAccount: 'Action.CreateANewAccount',
  ActionAddAccount: 'Action.AddAccount',
  DescriptionCurfewMessage: 'Description.CurfewMessage',
  DescriptionAccountSelectorHelp: 'Description.AccountSelectorHelp',
  DescriptionEnterOneTimeCodeHelp: 'Description.EnterOneTimeCodeHelp',
  DescriptionGetOneTimeCodeHelp: 'Description.GetOneTimeCodeHelp',
  DescriptionAccountSelectorOtpTimeWarning: 'Description.AccountSelectorOtpTimeWarning',
  DescriptionLogBackIn: 'Description.LogBackIn',
  DescriptionLogoutFirst: 'Description.LogoutFirst',

  HeadingLoginRoblox: 'Heading.LoginRoblox',
  HeadingLoginRobloxAccountSwitching: 'Heading.LoginRobloxAccountSwitching',
  HeadingContinueToEnjoyRoblox: 'Heading.ContinueToEnjoyRoblox',
  HeadingLoginRequired: 'Heading.LoginRequired',
  HeadingYouHaveLoggedOut: 'Heading.YouHaveLoggedOut',
  HeadingAddAccount: 'Heading.AddAccount',

  LabelEnterOneTimeCode: 'Label.EnterOneTimeCode',
  LabelGetOneTimeCode: 'Label.GetOneTimeCode',
  LabelNoAccount: 'Label.NoAccount',
  LabelPassword: 'Label.Password',
  LabelUsername: 'Label.Username',
  LabelUsernameEmailPhone: 'Label.UsernameEmailPhone',
  LabelLoginWithYour: 'Label.LoginWithYour',
  LabelUnverifiedEmailInstructions: 'Label.UnverifiedEmailInstructions',
  LabelNotReceived: 'Label.NotReceived',
  LabelVerificationEmailSent: 'Label.VerificationEmailSent',
  LabelEmailNeedsVerification: 'Label.EmailNeedsVerification',
  LabelAccountSelector: 'Label.AccountSelectorTitle',
  LabelLoginSwitchAccounts: 'Label.LoginSwitchAccounts',
  LabelChooseAccountToUse: 'Label.ChooseAccountToUse',

  MessageUnknownErrorTryAgain: 'Message.UnknownErrorTryAgain',
  MessageUsernameAndPasswordRequired: 'Message.UsernameAndPasswordRequired',

  ResponseAccountNotFound: 'Response.AccountNotFound',
  ResponseAccountIssueErrorContactSupport: 'Response.AccountIssueErrorContactSupport',
  ResponseTooManyAttemptsPleaseWait: 'Response.TooManyAttemptsPleaseWait',
  ResponseCaptchaErrorFailedToLoad: 'Response.CaptchaErrorFailedToLoad',
  ResponseCaptchaErrorFailedToVerify: 'Response.CaptchaErrorFailedToVerify',
  ResponseGlobalAppAccessError: 'Response.GlobalAppAccessError',
  ResponseIncorrectCredentials: 'Response.IncorrectCredentialsForgotPasswordMessage',
  ResponseIncorrectEmailOrPassword: 'Response.IncorrectEmailOrPassword',
  ResponseIncorrectPhoneOrPassword: 'Response.IncorrectPhoneOrPassword',
  ResponseIncorrectUsernamePassword: 'Response.IncorrectUsernamePassword',
  ResponseEmailLinkedToMultipleAccountsLoginWithUsername:
    'Response.EmailLinkedToMultipleAccountsLoginWithUsername',
  ResponseLoginWithUsername: 'Response.LoginWithUsername',
  ResponseUnverifiedEmailLoginWithUsername: 'Response.UnverifiedEmailLoginWithUsername',
  ResponseUnverifiedPhoneLoginWithUsername: 'Response.UnverifiedPhoneLoginWithUsername',
  ResponseVerificationError: 'Response.VerificationError',
  ResponseOtpUnder13NotAllowed: 'Response.OtpUnder13NotAllowed',
  ResponseLoginBlocked: 'Response.LoginBlocked',
  ResponseInvalidPasskeyCredential: 'Response.InvalidPasskeyCredential'
};

// Here are strings used by email verification modal
export const FeatureSignupComplianceModal = {
  HeadingVerifiedParentalConsentModalAddHeader: 'Heading.VerifiedParentalConsentModal.AddHeader',
  HeadingVerifiedParentalConsentModalVerifyHeader:
    'Heading.VerifiedParentalConsentModal.VerifyHeader',

  ActionVerifiedParentalConsentModalResendCode: 'Action.VerifiedParentalConsentModal.ResendCode',

  DescriptionEnterParentEmail: 'Description.EnterParentEmail',
  // Enter the code we just sent to {email}
  DescriptionVerifiedParentalConsentModalEnterCodeNoEmailReveal:
    'Description.VerifiedParentalConsentModal.EnterCodeNoEmailReveal',
  DescriptionVerifiedParentalConsentModalEnterContinue:
    'Description.VerifiedParentalConsentModal.EnterContinue',
  DescriptionSignupOtpModalLegalCheckboxLabel: 'Description.SignupOtpModal.LegalCheckboxLabel',
  LabelVerificationCode: 'Label.VerificationCode',
  LabelEmailAddress: 'Label.EmailAddress',
  LabelContinue: 'Label.Continue',
  LabelVerifiedParentalConsentModalChangeEmail: 'Label.VerifiedParentalConsentModal.ChangeEmail'
};

export const SsoErrorPage = {
  SomethingWentWrong: 'Response.SomethingWentWrong',
  UnknownError: 'Response.UnknownError'
};

export default {
  SsoErrorPage,
  FeatureLoginPage,
  FeatureSignupComplianceModal
};
