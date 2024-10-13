import { EnvironmentUrls } from 'Roblox';

export const koreaIdVerification = '/id-verification/korea/';

export const localeParamName = '?locale=';

export const urlQueryNames = {
  locale: 'locale'
};

export const newUserParam = 'nu=true';

export const validateUsernameContext = 'Signup';

export const maxKeystrokeDataLength = 200;

export const keystrokeSampleRate = 1.0;

export const arbitraryLargePrimeNumber = 1618033;

export const identityVerificationResultTokenName = 'identityVerificationResultToken';

export const counters = {
  prefix: 'WebsiteSignUp_',
  firstAttempt: 'FirstAttempt',
  attempt: 'Attempt',
  success: 'Success',
  successWithSAI: 'SuccessWithSAI',
  successWithGameIntent: 'SuccessWithGameIntent',
  successWithVNG: 'SuccessWithVNG',
  captcha: 'Captcha',
  tooManyAttempts: 'TooManyAttempts',
  passwordInvalid: 'PasswordInvalid',
  usernameInvalid: 'UsernameInvalid',
  usernameTaken: 'UsernameTaken',
  identityVerificationResultTokenInvalid: 'InvalidIdentityVerificationResultToken',
  identityVerificationFailed: 'IdentityVerificationFailed',
  unknownError: 'UnknownError'
};

export const urlConstants = {
  signup: `${EnvironmentUrls.authApi}/v2/signup`,
  metadataV2: `${EnvironmentUrls.authApi}/v2/metadata`,
  userAgreements: `${EnvironmentUrls.userAgreementsServiceApi}/v1/agreements-resolution-signup/web`,
  validateUsername: `${EnvironmentUrls.authApi}/v1/usernames/validate`,
  validatePassword: `${EnvironmentUrls.authApi}/v2/passwords/validate`,
  usernameSuggestion: `${EnvironmentUrls.authApi}/v1/validators/username`,
  homePageNewUser: '/home?nu=true',
  termsOfUse: `${EnvironmentUrls.websiteUrl}/info/terms`,
  privacy: `${EnvironmentUrls.websiteUrl}/info/privacy`,
  koreaComplianceTermsOfService: `https://en.help.roblox.com/hc/articles/15685174241172-Roblox-Terms-of-Use-Republic-of-Korea-`,
  koreaCompliancePrivacyPolicy: `https://en.help.roblox.com/hc/articles/15685139483924-Additional-Information-for-users-in-Korea`,
  koreaCompliancePersonalInformationPolicy: `https://en.help.roblox.com/hc/ko/articles/20308349061268`,
  koreaComplianceThirdPartyPersonalInformationPolicy: `https://en.help.roblox.com/hc/ko/articles/20308327256596`,
  koreaComplianceTransferPersonalInformationPolicy: `https://en.help.roblox.com/hc/ko/articles/20308327256596`,
  koreaComplianceOptionalPersonalInformationPolicy: `https://en.help.roblox.com/hc/ko/articles/20308349061268`
};

export const anchorOpeningTag = '<a target="_blank" href="';
export const anchorOpeningTagEnd = '">';
export const anchorClosingTag = '</a>';

export const birthdayPickerConstants = {
  year: {
    id: 'YearDropdown',
    class: 'year',
    name: 'birthdayYear',
    type: 'year'
  },
  month: {
    id: 'MonthDropdown',
    class: 'month',
    name: 'birthdayMonth',
    type: 'month'
  },
  day: {
    id: 'DayDropdown',
    class: 'day',
    name: 'birthdayDay',
    type: 'day'
  }
};

export const monthStrings = [
  'Label.January',
  'Label.February',
  'Label.March',
  'Label.April',
  'Label.May',
  'Label.June',
  'Label.July',
  'Label.August',
  'Label.September',
  'Label.October',
  'Label.November',
  'Label.December'
];

export const signupFormStrings = {
  Heading: 'Heading.SignupHaveFun',
  HeadingCreateANewAccount: 'Heading.CreateANewAccount',
  Birthday: 'Label.Birthday',
  Day: 'Label.Day',
  Month: 'Label.Month',
  Year: 'Label.Year',
  Username: 'Label.Username',
  UsernamePlaceholder: 'Message.Username.NoRealNameUse',
  Password: 'Label.Password',
  PasswordPlaceholder: 'Label.PasswordPlaceholder',
  SignUpAgreement: 'Description.SignUpAgreement',
  TermsOfUSe: 'Label.TermsOfUse',
  Privacy: 'Description.PrivacyPolicy',
  SignUp: 'GuestSignUpAB.Action.SignUp',
  ComplianceTos: 'Description.SignupCompliance.TermsOfUse',
  CompliancePrivacyPolicyAck: 'Description.SignupCompliance.PrivacyPolicyAck',
  EmailU13: 'Label.EmailRequirementsUnder13',
  KoreaAdultUser: 'Description.PersonalInfoForUser',
  IdVerificationErrorTitle: 'Title.VerificationError',
  IdVerificationErrorBody: 'Description.VerificationNotComplete',
  TryAgain: 'Action.TryAgain',
  FinishAccountCreation: 'Heading.FinishAccountCreation',
  SelectBirthdate: 'Description.SelectBirthdate',
  LoginWithEmail: 'Description.LoginWithEmail',
  Try: 'Description.Try',
  CreateAccount: 'Action.CreateAccount',
  BirthdayRequired: 'Label.BirthdayRequired'
};

export const validationMessages = {
  usernameInvalid: 'Response.UsernameInvalid',
  usernameAlreadyInUse: 'Response.UsernameAlreadyInUse',
  badUsername: 'Response.BadUsername',
  usernamePii: 'Response.UsernamePrivateInfo',
  usernameNotAvailable: 'Response.UsernameNotAvailable',
  usernameRequired: 'Response.PleaseEnterUsername',
  birthdayRequired: 'Response.BirthdayMustBeSetFirst',
  useDifferentPassword: 'Response.DifferentPasswordRequired',
  passwordInvalid: 'Response.InvalidPassword',
  birthdayInvalid: 'Response.InvalidBirthday',
  javascriptRequired: 'Response.JavaScriptRequired',
  unknownError: 'Response.UnknownError',
  accountCreatedButLoginFailed: 'Response.UserAccountCreatedButLoginFailed',
  captchaFailedToLoad: 'Response.CaptchaErrorFailedToLoad',
  captchaFailedToVerify: 'Response.CaptchaErrorFailedToVerify',
  invalidEmail: 'Response.InvalidEmail'
};

export const koreaComplianceSignupStrings = {
  ReviewAndConsentToTerms: 'Description.ReviewAndConsentToTerms',
  ConsentToAllTerms: 'Description.ConsentToAllTerms',
  Required: 'Label.Required',
  ParentConsentNeeded: 'Label.ParentConsentNeeded',
  TermsConditionsAndPrivacyPolicy: 'Description.TermsConditionsAndPrivacyPolicy',
  Agree: 'Action.Agree',
  Optional: 'Label.Optional',
  UserAgreementsTerms: 'Description.UserAgreementsTerms',
  TermsAndConditions: 'Action.TermsAndConditions',
  PrivacyPolicy: 'Action.PrivacyPolicy',
  OptionalPersonalInformationTerms: 'Description.OptionalPersonalInformationTerms',
  OptionalPersonalInformation: 'Action.OptionalPersonalInformation',
  RequiredPersonalInformationTerms: 'Description.RequiredPersonalInformationTerms',
  RequiredPersonalInformation: 'Action.RequiredPersonalInformation',
  OverseasPersonalInformationTerms: 'Description.OverseasPersonalInformationTerms',
  OverseasPersonalInformationTransfer: 'Action.OverseasPersonalInformationTransfer',
  ThirdPartyPersonalInformationTerms: 'Description.ThirdPartyPersonalInformationTerms',
  ThirdPartyPersonalInformationProvision: 'Action.ThirdPartyPersonalInformationProvision',
  KoreaConsentTermsforAbove14users: 'Description.KoreaConsentTerms',
  ConsentNeeded: 'Label.ConsentNeeded'
};

export const usernameValidationMessageMap = new Map<number, string>([
  [1, validationMessages.usernameAlreadyInUse],
  [2, validationMessages.badUsername],
  [10, validationMessages.usernamePii],
  [12, validationMessages.usernameNotAvailable]
]);

export const errorCodes = {
  captcha: 2,
  forbidden: 403,
  identityVerificationFailed: 110,
  insertAcceptancesFailed: 111,
  invalidBirthdate: 4,
  invalidIdentityVerificationResultToken: 109,
  invalidPassword: 7,
  invalidUsername: 5,
  passwordSameAsUsername: 8,
  passwordTooSimple: 9,
  usernameTaken: 6,
  tooManyAttepmts: 429,
  ageUnder13: 19,
  ageUnder18: 20,
  emptyAccountSwitchBlobRequired: 21,
  maxLoggedInAccountsLimitReached: 22,
  parentEmptyAccountSwitchBlobRequired: 23
};

export const experimentVariables = {
  isSignupButtonDisabled: 'isSignupButtonDisabled',
  isStrictComplianceEnabledForKorea: 'isStrictComplianceEnabledForKorea',
  isStrictComplianceEnabledForBrazil: 'isStrictComplianceEnabledForBrazil',
  isKoreaEnhancedComplianceEnabled: 'IsKoreaEnhancedComplianceEnabled'
};

export const maxSignUpAge = 100;
export const minSignUpAge = 5;
export const maxNumberOfDates = 31;

export const reactSignupCaptchaContainer = 'react-signup-captcha-container';
export const accountSwitcherConfirmationModalContainer =
  'account-switcher-confirmation-modal-container';
export const reactSignupAccountLimitContainer = 'react-signup-account-limit-container';

export const otpModalConstants = {
  otpSignupContainer: 'otp-signup-container',
  origin: 'signup'
};

export const complianceConstants = {
  Korea: {
    name: 'Korea',
    ageThreshold: 14
  },
  Brazil: {
    name: 'Brazil',
    ageThreshold: 12
  },
  Vietnam: {
    name: 'Vietnam'
  }
};

export const USER_AGREEMENTS = {
  ParentalConsent: 'ParentalContent',
  OptionalPersonalInformationPolicy: 'OptionalPersonalInformationPolicy'
};
export const PARENTALCONSENT = 'ParentalConsent';
export const OPTIONAL_PERSONAL_INFORMATION_POLICY = 'OptionalPersonalInformationPolicy';
export const requestTypeParam = 'requestType';
export const sessionIdParam = 'sessionId';
