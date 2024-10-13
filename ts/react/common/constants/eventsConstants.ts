/**
 * Constants for event stream events in auth webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authFormInteraction: 'authFormInteraction',
    authButtonClick: 'authButtonClick',
    authMsgShown: 'authMsgShown',
    authPageLoad: 'authPageload',
    authModalShown: 'authModalShown',
    authClientError: 'authClientError',
    usernameSuggestionShown: 'usernameSuggestionShown'
  },
  eventName: {
    loginOtherDevice: 'loginOtherDevice',
    formValidation: 'formValidation',
    authPageLoad: 'authPageload',
    authFormInteraction: 'authFormInteraction',
    authButtonClick: 'authButtonClick',
    authModalShown: 'authModalShown',
    saiCreated: 'saiCreated',
    saiMissing: 'saiMissing',
    signupUsernameKeystrokes: 'accountIntegrityKeystrokeEvents',
    // NOTE (jcountryman, 08/23/24): This event tracks if the affiliate link API
    // call was successful
    qualifiedSignup: 'qualifiedSignup'
  },
  context: {
    loginPage: 'loginPage',
    loginForm: 'LoginForm',
    schematizedLoginForm: 'loginForm',
    landingPage: 'Multiverse',
    ssoLtiInit: 'ssoLtiInit',
    ssoLtiLaunch: 'ssoLtiLaunch',
    ssoError: 'ssoError',
    signupForm: 'MultiverseSignupForm',
    schematizedSignupForm: 'signupForm',
    sendOTP: 'sendOTP',
    schematizedSendOTP: 'sendOtp',
    enterOTP: 'enterOTP',
    schematizedEnterOTP: 'enterOtp',
    validateOTP: 'validateOTP',
    disambiguationOTP: 'disambiguationOTP',
    disambiguationEmail: 'disambiguationEmail',
    disambiguationPhone: 'disambiguationPhone',
    disambigOTP: 'disambigOtp',
    revertAccount: 'revertAccount',
    accountSwitcherConfirmation: 'accountSwitcherConfirmation',
    accountSwitcherModal: 'accountSwitcherModal',
    accountSwitcherLimitError: 'accountSwitcherLimitError',
    accountSwitcherLogin: 'accountSwitcherLogin',
    accountSwitcherSignup: 'accountSwitcherSignup',
    accountSwitcherBackendRequestFailure: 'accountSwitcherBackendRequestFailure',
    accountSwitcherLocalStorageFailure: 'accountSwitcherLocalStorageFailure',
    accountSwitcherVpcLogin: 'accountSwitcherVpcLogin',
    accountSwitcherVpcSignup: 'accountSwitcherVpcSignup',
    passkeyLogin: 'passkeyLogin',
    hba: 'hba'
  },
  verifiedParentalConsentContext: {
    chargeback: {
      finishParentalSignup: 'finishParentalSignup',
      homepage: 'homepage'
    },
    savePaymentMethods: {
      finishParentalSignup: 'finishParentalSignupDevsubs',
      homepage: 'homepageDevsubs'
    },
    changeBirthdayContext: {
      finishParentalSignup: 'finishParentalSignupAgeChange',
      homepage: 'homepageAgeChange'
    }
  },
  aType: {
    buttonClick: 'buttonClick',
    click: 'click',
    offFocus: 'offFocus',
    focus: 'focus',
    shown: 'shown',
    dismissed: 'dismissed'
  },
  field: {
    loginOtherDevice: 'loginOtherDevice',
    loginOTP: 'loginOTP',
    OTP: 'otp',
    loginSubmitButtonName: 'loginSubmit',
    password: 'password',
    username: 'username',
    signupSubmitButtonName: 'signupSubmit',
    appButtonClickName: 'AppLink',
    showPassword: 'showPassword',
    hidePassword: 'hidePassword',
    birthdayDay: 'birthdayDay',
    birthdayMonth: 'birthdayMonth',
    birthdayYear: 'birthdayYear',
    signupUsername: 'signupUsername',
    signupPassword: 'signupPassword',
    signupEmail: 'signupEmail',
    parentEmail: 'parentEmail',
    genderMale: 'genderMale',
    genderFemale: 'genderFemale',
    email: 'email',
    code: 'code',
    otpCode: 'OTPcode',
    errorMessage: 'errorMessage',
    resendErrorMessage: 'resendErrorMessage',
    accountSelection: 'accountSelection',
    checked: 'checked',
    unchecked: 'unchecked',
    usernameValid: 'usernameValid',
    revertAccountSubmitButtonName: 'revertAccountSubmit',
    birthday: 'birthday',
    accountSwitcher: 'accountSwitcher',
    logoutPopup: 'logoutPopup',
    hasAuthIntent: 'hasAuthIntent'
  },
  btn: {
    cancel: 'cancel',
    sendCode: 'sendCode',
    resendCode: 'resendCode',
    resend: 'resend',
    login: 'login',
    logoutAll: 'logoutAll',
    signup: 'signup',
    continue: 'continue',
    changeEmail: 'changeEmail',
    select: 'select',
    parentalConsentCheckbox: 'pc_checkbox',
    termsOfServiceCheckbox: 'tos_checkbox',
    privacyPolicyCheckbox: 'pp_checkbox',
    submitRevertAccount: 'submitRevertAccount',
    dismiss: 'dismiss',
    switch: 'switch',
    addAccount: 'addAccount',
    primaryButton: 'primaryButton',
    secondaryButton: 'secondaryButton',
    usernameSuggestion: 'usernameSuggestion',
    launchSsoDeeplink: 'launchSsoDeeplink',
    koreaConsentAllCheckbox: 'koreaConsentAll',
    koreaTosAndPrivacyPolicyCheckbox: 'koreaToS1',
    koreaThirdPartyPersonalInfoCheckbox: 'koreaToS2',
    koreaTransferPersonalInfoCheckbox: 'koreaToS3',
    koreaPersonalInfoCheckbox: 'koreaToS4',
    koreaOptionalPersonalInfoCheckbox: 'koreaToS5Optional',
    koreaAgreeTermsOfService: 'koreaAgreeToS',
    logoutPopupLogout: 'logoutPopupLogout'
  },
  input: {
    redacted: '[Redacted]'
  },
  origin: {
    webVerifiedSignup: 'WebVerifiedSignup',
    signup: 'signup',
    login: 'login'
  },
  text: {
    finishCreatingYourAccount: 'Create Your Roblox Account',
    signup: 'Sign Up',
    createAccount: 'Create Account',
    logout: 'Log Out'
  },
  clientErrorTypes: {
    pageLoadFailed: 'pageLoadFailed',
    userInfoFetchFailed: 'userInfoFetchFailed',
    localStorageSetFailure: 'localStorageSetFailure',
    localStorageGetFailure: 'localStorageGetFailure',
    localStorageRemoveFailure: 'localStorageRemoveFailure',
    logoutAllAccountSwitcherAccounts: 'logoutAllAccountSwitcherAccounts'
  }
} as const;

export default EVENT_CONSTANTS;
