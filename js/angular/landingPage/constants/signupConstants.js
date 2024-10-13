import { EnvironmentUrls } from 'Roblox';
import landingPageModule from '../landingPageModule';

const signupConstants = {
  urls: {
    signUpApi: '/v2/signup',
    metaData: '/landing/metadata',
    metadataV2: '/v2/metadata',
    weChatSignUp: '/v2/wechat/signup',
    termsOfUse: '/info/terms',
    privacy: '/info/privacy',
    gamesNewUser: '/discover?nu=true',
    homePageNewUser: '/home?nu=true',
    homePage: '/home',
    verifiedSignupChallenge: '/v1/verified-signup/challenge',
    verifiedSignupVoucher: '/v1/verified-signup/voucher',
    verifiedSignup: '/v1/verified-signup',
    koreaIdVerification: '/id-verification/korea/'
  },
  emailRegex: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
  genderType: {
    unknown: 1,
    male: 2,
    female: 3
  },
  inputType: {
    password: 'password',
    text: 'text'
  },
  urlQueryNames: {
    locale: 'locale'
  },
  referralQueryNames: {
    rbxSource: 'rbx_source',
    rbxCampaign: 'rbx_campaign',
    rbxMedium: 'rbx_medium',
    reqId: 'req_id',
    offerId: 'offer_id'
  },
  maxSignUpAge: 100,
  context: 'Multiverse',
  maxNumberOfDates: 31,
  anchorOpeningTag: '<a target="_blank" href="',
  anchorClosingTag: '</a>',
  localeParamName: '?locale=',
  nonLeapYear: '2014',
  newUserParam: 'nu=true',
  apiUrls: {
    enrollAbtestingApi: {
      url: `${EnvironmentUrls.abtestingApiSite}/v1/enrollments`,
      retryable: false,
      withCredentials: true
    },
    userAgreementsAcceptanceApi: {
      url: `${EnvironmentUrls.userAgreementsServiceApi}/v1/agreements-resolution/web`
    }
  },
  userAgreementsInsertAcceptancesFailureReason: 'InsertAcceptancesFailed',
  unknownErrorTranslationKey: 'Response.UnknownError',
  accountCreatedButLoginFailedTranslationKey: 'Response.UserAccountCreatedButLoginFailed',
  abtestingRequest: {
    subjectType: 'User'
  },
  abtestingResponse: {
    status: {
      enrolled: 'Enrolled'
    },
    landingTohomePageVariation: 2
  },
  counters: {
    prefix: 'WebsiteSignUp_',
    firstAttempt: 'FirstAttempt',
    attempt: 'Attempt',
    success: 'Success',
    captcha: 'Captcha',
    tooManyAttempts: 'TooManyAttempts',
    passwordInvalid: 'PasswordInvalid',
    usernameInvalid: 'UsernameInvalid',
    usernameTaken: 'UsernameTaken',
    identityVerificationResultTokenInvalid: 'InvalidIdentityVerificationResultToken',
    identityVerificationFailed: 'IdentityVerificationFailed',
    unknownError: 'UnknownError'
  },
  signUpSubmitButtonName: 'signupSubmit',
  weChatSignUpSubmitButtonName: 'weChatSignupSubmit',
  birthdayPicker: {
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
  },
  defaultDateOrdering: {
    month: 0,
    day: 1,
    year: 2
  },
  defaultDateParts: {
    0: {
      options: [
        {
          label: 'Month',
          value: null
        }
      ],
      id: 'MonthDropdown',
      class: 'month',
      name: 'birthdayMonth',
      type: 'month'
    },
    1: {
      options: [
        {
          label: 'Day',
          value: null
        }
      ],
      id: 'DayDropdown',
      class: 'day',
      name: 'birthdayDay',
      type: 'day'
    },
    2: {
      options: [
        {
          label: 'Year',
          value: null
        }
      ],
      id: 'YearDropdown',
      class: 'year',
      name: 'birthdayYear',
      type: 'year'
    }
  },
  events: {
    buttonClick: 'buttonClick',
    fields: {
      showPassword: 'showPassword',
      hidePassword: 'hidePassword'
    }
  },
  identityVerificationResultToken: 'identityVerificationResultToken'
};

landingPageModule.constant('signupConstants', signupConstants);

export default signupConstants;
