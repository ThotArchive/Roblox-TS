import {
  EnvironmentUrls,
  FormEvents,
  Intl,
  Resources,
  Auth,
  PhoneNumberVerificationService,
  ReactSignupService,
  ReactLandingEventService,
  ReactSignupUtils,
  ReactIdentityVerificationUtils,
  ExperimentationService
} from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';
import events from '../constants/verifiedSignupEventStreamConstants';
import landingPageConstants from '../constants/landingPageConstants';
import landingPageModule from '../landingPageModule';

function signupController(
  $injector,
  $scope,
  $log,
  $timeout,
  signupService,
  signupConstants,
  captchaV2Constants,
  languageResource,
  eventStreamService,
  phoneService,
  regexService,
  modalService
) {
  'ngInject';

  $scope.signup = {};
  $scope.layout = {
    context: signupConstants.context,
    passwordInputType: signupConstants.inputType.password,
    isFirstSignUpSubmit: true,
    orderedBirthdayParts: {
      parts: signupConstants.defaultDateParts,
      typeOrder: signupConstants.defaultDateOrdering
    },
    isSubmitting: false
  };
  $scope.signUpParams = $scope.signUpParams || {};
  const intl = new Intl();

  $scope.genderType = signupConstants.genderType;
  $scope.signup.gender = $scope.genderType.unknown;
  $scope.birthdayToPrefill = $scope.$parent.birthdayToPrefill;

  $scope.captchaActivated = false;
  $scope.captchaActionTypes = captchaV2Constants.captchaActionTypes;
  $scope.emailRegex = signupConstants.emailRegex;

  function setMonthList() {
    $scope.layout.months = [
      { value: 'Jan', label: languageResource.get('Label.January') },
      { value: 'Feb', label: languageResource.get('Label.February') },
      { value: 'Mar', label: languageResource.get('Label.March') },
      { value: 'Apr', label: languageResource.get('Label.April') },
      { value: 'May', label: languageResource.get('Label.May') },
      { value: 'Jun', label: languageResource.get('Label.June') },
      { value: 'Jul', label: languageResource.get('Label.July') },
      { value: 'Aug', label: languageResource.get('Label.August') },
      { value: 'Sep', label: languageResource.get('Label.September') },
      { value: 'Oct', label: languageResource.get('Label.October') },
      { value: 'Nov', label: languageResource.get('Label.November') },
      { value: 'Dec', label: languageResource.get('Label.December') }
    ];
    const placeholder = languageResource.get('Label.Month');
    setOrderedBirthdayPart('month', $scope.layout.months, placeholder);
  }

  function setDateList() {
    const dates = [];
    const maximumDate = signupConstants.maxNumberOfDates;

    for (let i = 1; i <= maximumDate; i++) {
      // add leading zero (1 => 01 and 10 => 10)
      const day = `0${i}`.slice(-2);
      const i18nDay = {
        day,
        value: day,
        label: $scope.isAsianBirthdayUsed
          ? intl.getFormattedDateString(day, languageResource.get('Label.Day'))
          : day
      };
      dates.push(i18nDay);
    }

    $scope.layout.dates = dates;

    const placeholder = languageResource.get('Label.Day');
    setOrderedBirthdayPart('day', dates, placeholder);
  }

  function setYearList() {
    const years = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const minimumYear = currentYear - signupConstants.maxSignUpAge;

    for (let i = currentYear; i > minimumYear; i--) {
      const i18nYear = {
        year: i,
        value: i,
        label: $scope.isAsianBirthdayUsed
          ? intl.getFormattedDateString(i, languageResource.get('Label.Year'))
          : i
      };
      years.push(i18nYear);
    }

    $scope.layout.years = years;

    const placeholder = languageResource.get('Label.Year');
    setOrderedBirthdayPart('year', years, placeholder);
  }

  function setOrderedBirthdayPart(partName, value, placeholder) {
    const partIndex = $scope.layout.orderedBirthdayParts.typeOrder[partName];

    $scope.layout.orderedBirthdayParts.parts[partIndex] = {
      options: value,
      idName: signupConstants.birthdayPicker[partName].id,
      className: signupConstants.birthdayPicker[partName].class,
      birthdayName: signupConstants.birthdayPicker[partName].name,
      placeholder
    };
  }

  function setSignUpFormValidatorResources() {
    if (!Resources) {
      return;
    }

    // TODO: update this once AnimatedSignupFormValidator is moved to authsite
    Resources.AnimatedSignupFormValidator = {
      maxValid: languageResource.get('Response.TooManyAccountsWithSameEmailError'),
      invalidEmail: languageResource.get('Response.InvalidEmail'),
      invalidPhone: languageResource.get('Response.InvalidPhoneNumber'),
      invalidBirthday: languageResource.get('Response.InvalidBirthday'),
      loginFieldsRequired: languageResource.get('Response.UsernamePasswordRequired'),
      loginFieldsIncorrect: languageResource.get('Response.UsernameOrPasswordIncorrect'),
      doesntMatch: languageResource.get('Response.PasswordMismatch'),
      passwordIsUsername: languageResource.get('Response.PasswordContainsUsernameError'),
      requiredField: languageResource.get('Label.Required'),
      passwordBadLength: languageResource.get('Response.PasswordBadLength'),
      weakKey: languageResource.get('Response.PasswordComplexity'),
      invalidCharacters: languageResource.get('Response.SpaceOrSpecialCharaterError'),
      invalidName: languageResource.get('Response.UsernameAllowedCharactersError'),
      cantBeUsed: languageResource.get('Response.BadUsername'),
      cantBeUsedPii: languageResource.get('Response.UsernamePrivateInfo'),
      alreadyTaken: languageResource.get('Response.UsernameAlreadyInUse'),
      userNameInvalidLength: languageResource.get('Response.UsernameInvalidLength'),
      startsOrEndsWithUnderscore: languageResource.get('Response.UsernameInvalidUnderscore'),
      moreThanOneUnderscore: languageResource.get('Response.UsernameTooManyUnderscores'),
      birthdayRequired: languageResource.get('Response.BirthdayMustBeSetFirst'),
      passwordRequired: languageResource.get('Response.PleaseEnterPassword'),
      usernameRequired: languageResource.get('Response.PleaseEnterUsername'),
      passwordConfirmationRequired: languageResource.get('Response.PasswordConfirmation'),
      usernameNoRealNameUse: languageResource.get('Message.Username.NoRealNameUse'),
      passwordMinLength: languageResource.get('Message.Password.MinLength'),
      usernameNotAvailable: languageResource.get('Response.UsernameNotAvailable'),
      useDifferentPasswordCharactersOrNumbers: languageResource.get(
        'Response.DifferentPasswordRequired'
      )
    };
  }

  function prefillBirthdayIfNecessary() {
    if ($scope.birthdayToPrefill) {
      const birthday = new Date($scope.birthdayToPrefill);
      const dateIndex = birthday.getDate() - 1;
      const dateToPrefill = $scope.layout.dates[dateIndex].value;
      $scope.signup.birthdayDay = dateToPrefill;
      const monthIndex = birthday.getMonth();
      const prefillMonth = $scope.layout.months[monthIndex].value;
      $scope.signup.birthdayMonth = prefillMonth;
      const prefillYearInt = birthday.getFullYear();
      const prefillYear = $scope.layout.years.find(({ year }) => year === prefillYearInt).value;
      $scope.signup.birthdayYear = prefillYear.toString();

      // lock birthday if user <18
      const now = new Date();
      const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
      const ageDiff = now - birthday;
      $scope.isPrefilledBirthdayUnder18 = ageDiff < now - eighteenYearsAgo;
      $scope.layout.shouldDisableBirthdaySelect = $scope.isPrefilledBirthdayUnder18;
    }
  }

  window.addEventListener(
    'PhoneNumberValidated',
    event => {
      $scope.signup.voucher = event.detail.voucher;
      if ($scope.signup.voucher) {
        $scope.submitSignup(false);
      }
    },
    false
  );

  $scope.shouldBlockSignupForTerms = false;
  if (ExperimentationService?.getAllValuesForLayer) {
    ExperimentationService.getAllValuesForLayer(landingPageConstants.experimentLayer).then(
      ixpResult => {
        $scope.shouldBlockSignupForTerms = ixpResult?.shouldRequireTermsCheckbox ?? false;
        $scope.$apply();
      }
    );
  }

  $scope.shouldShowTermsError = false;
  $scope.signup.isTermsCheckboxChecked = false;

  $scope.init = function () {
    // On web, email is the default (on mobile, it is phone)
    $scope.contactMethodIsEmail = true;
    $scope.isAsianBirthdayUsed = intl && intl.isAsianLanguage();
    $scope.layout.orderedBirthdayParts.typeOrder = new Intl()
      .getDateTimeFormatter()
      .getOrderedDateParts();
    setSignUpFormValidatorResources();
    setMonthList();
    setDateList();
    setYearList();
    prefillBirthdayIfNecessary();

    const locale = ReactSignupUtils.getLocale();
    const termsOfUseLink = EnvironmentUrls.websiteUrl + signupConstants.urls.termsOfUse;
    const privacyLink = EnvironmentUrls.websiteUrl + signupConstants.urls.privacy;
    const termsOfUseLocalizedLink = ReactSignupUtils.buildLinkWithLocale(termsOfUseLink, locale);
    const privacyLocalizedLink = ReactSignupUtils.buildLinkWithLocale(privacyLink, locale);
    $scope.layout.termsOfUseLinkElement = `${
      signupConstants.anchorOpeningTag + termsOfUseLocalizedLink
    }">${languageResource.get('Label.TermsOfUse')}${signupConstants.anchorClosingTag}`;
    $scope.layout.privacyLinkElement = `${
      signupConstants.anchorOpeningTag + privacyLocalizedLink
    }">${languageResource.get('Description.PrivacyPolicy')}${signupConstants.anchorClosingTag}`;

    function fetchUserAgreements() {
      $scope.agreementIds = [];
      ReactSignupService.getUserAgreements()
        .then(agreements => {
          agreements.forEach(agreement => {
            $scope.agreementIds.push(agreement.id);
          });
        })
        .catch(error => {
          $log.error('signupController fetchUserAgreements error ', error);
        });
    }

    // This call is used for experimentation / AB testing variants
    ReactSignupService.getMetadataV2()
      .then(data => {
        if (data) {
          $scope.isContactMethodRequiredAtSignup = data.IsContactMethodRequiredAtSignup;
          $scope.isUserAgreementsSignupIntegrationEnabled =
            data.IsUserAgreementsSignupIntegrationEnabled;
        }

        if ($scope.isContactMethodRequiredAtSignup) {
          $scope.getPhonePrefixes();
          $scope.getEmailRegex();
        }

        if ($scope.isUserAgreementsSignupIntegrationEnabled) {
          fetchUserAgreements();
        }
      })
      .catch(error => {
        $log.error('signupController $scope.init error ', error);
      });
  };

  $scope.isParentEmailForKoreaUserEnabled = function () {
    return (
      ($scope.isPrefilledBirthdayUnder18 ||
        ReactIdentityVerificationUtils.isUnderThresholdAge(
          18,
          $scope.signup.birthdayYear,
          $scope.signup.birthdayMonth,
          $scope.signup.birthdayDay
        )) &&
      $scope.isKoreaIdVerificationEnabled
    );
  };

  $scope.handleCaptchaError = function (errorCode) {
    let errorText;

    switch (errorCode) {
      case captchaV2Constants.errorCodes.internal.failedToLoadProviderScript:
        errorText = languageResource.get('Response.CaptchaErrorFailedToLoad');
        break;
      default:
        errorText = languageResource.get('Response.CaptchaErrorFailedToVerify');
    }

    // Accepted way to prevent calling "$digest" again when digest is already in progress
    // If this callback fires as the result of an asynchronous request, we need to trigger
    // $digest manually, which can be accomplished with $timeout. We can't call $scope.$apply
    // because this will cause an error if it is already in progress.
    // https://davidburgos.blog/correctly-fix-angularjs-error-digest-already-in-progress/
    $timeout(function () {
      $scope.layout.isSubmitting = false;
      $scope.signupForm.$generalError = true;
      $scope.signupForm.$generalErrorText = errorText;
    }, 0);
  };

  $scope.handleCaptchaDismiss = function () {
    $scope.layout.isSubmitting = false;
    $scope.$apply();
  };

  $scope.handleCaptchaSuccess = function (captchaData) {
    $scope.captchaActivated = false;
    $scope.submitSignup(false, captchaData);
  };

  $scope.setGender = function (e, genderType, lockField) {
    if (e) {
      e.preventDefault();
    }

    if ($scope.layout.isGenderDisabled) {
      return;
    }

    $scope.signup.gender =
      $scope.signup.gender === genderType ? $scope.genderType.unknown : genderType;
    $scope.layout.isGenderDisabled = lockField;
  };

  /* START BIRTHDAY FUNCTIONS */

  $scope.isBirthdayFormDirty = function () {
    // Birthday Form can only be dirty when it exists
    if (
      $scope.signupForm.birthdayMonth &&
      $scope.signupForm.birthdayDay &&
      $scope.signupForm.birthdayYear
    ) {
      return (
        $scope.signupForm.birthdayMonth.$dirty &&
        $scope.signupForm.birthdayDay.$dirty &&
        $scope.signupForm.birthdayYear.$dirty &&
        $scope.signupForm.birthdayMonth.$modelValue !== null &&
        $scope.signupForm.birthdayDay.$modelValue !== null &&
        $scope.signupForm.birthdayYear.$modelValue !== null
      );
    }
    return false;
  };

  $scope.toggleTermsAgreementAcceptance = function () {
    $scope.signup.isTermsCheckboxChecked = !$scope.signup.isTermsCheckboxChecked;
    signupService.sendSignupEvent(
      $scope.signup.isTermsCheckboxChecked
        ? events.checkedTermsCheckbox
        : events.uncheckedTermsCheckbox
    );
    $scope.shouldShowTermsError = false; // don't show error message after user interacts with checkbox again
  };

  $scope.isSignupBlockedByTermsCheckbox = function () {
    return $scope.shouldBlockSignupForTerms && !$scope.signup.isTermsCheckboxChecked;
  };

  $scope.getTermsNotAcceptedInvalidMessage = function () {
    return $scope.shouldShowTermsError && $scope.isSignupBlockedByTermsCheckbox()
      ? languageResource.get('Label.ErrorAcceptTermsToContinue')
      : '';
  };

  $scope.isBirthdayInvalid = function () {
    return (
      ($scope.badSubmit || $scope.isBirthdayFormDirty()) &&
      (!ReactSignupUtils.isValidBirthday(
        $scope.signup.birthdayYear,
        $scope.signup.birthdayMonth,
        $scope.signup.birthdayDay
      ) ||
        $scope.signupForm.birthdayYear.$invalid)
    );
  };

  $scope.getBirthdayInvalidMessage = function () {
    return $scope.isBirthdayInvalid() ? languageResource.get('Response.InvalidBirthday') : '';
  };

  $scope.isUnder13 = function () {
    return ReactIdentityVerificationUtils.isUnderThresholdAge(
      13,
      $scope.signup.birthdayYear,
      $scope.signup.birthdayMonth,
      $scope.signup.birthdayDay
    );
  };

  $scope.isUnderThresholdAge = function (age) {
    const year = $scope.signup.birthdayYear;
    const month = $scope.signup.birthdayMonth;
    const day = $scope.signup.birthdayDay;

    if (!year || !month || !day) {
      return false;
    }

    const testDate = new Date(`${month} ${day} ${year}`);
    const now = new Date();
    now.setFullYear(now.getFullYear() - age);
    return testDate > now;
  };

  /* END BIRTHDAY FUNCTIONS */

  /* START CONTACT METHOD FUNCTIONS */
  $scope.getContactMethodLabelText = function () {
    if ($scope.contactMethodIsEmail) {
      return $scope.getEmailLabelText();
    }
    return $scope.getPhoneLabelText();
  };

  $scope.switchToPhone = function () {
    signupService.sendSignupEvent(events.usePhone);
    $scope.contactMethodIsEmail = false;
  };

  $scope.switchToEmail = function () {
    signupService.sendSignupEvent(events.useEmail);
    $scope.contactMethodIsEmail = true;
  };

  $scope.onEmailFocused = function () {
    if ($scope.isContactMethodRequiredAtSignup) {
      signupService.sendSignupEvent(events.emailFocused);
    }
    if ($scope.isParentEmailForKoreaUserEnabled()) {
      signupService.sendSignupEvent(events.parentEmailForKoreaUnderage);
    }
  };

  $scope.onPhoneFocused = function () {
    signupService.sendSignupEvent(events.phoneFocused);
  };

  /* START EMAIL FUNCTIONS */
  $scope.getEmailRegex = function () {
    regexService.getEmailRegex().then(data => {
      if (data) {
        $scope.emailRegex = data.Regex;
      }
    });
  };

  $scope.shouldOfferEmailAtSignup = function () {
    return $scope.isContactMethodRequiredAtSignup || $scope.isParentEmailForKoreaUserEnabled();
  };

  $scope.canChooseEmailOrPhoneNumberAtSignup = function () {
    if ($scope.isParentEmailForKoreaUserEnabled()) {
      return false;
    }

    if ($scope.isUnder13()) {
      return false;
    }

    return $scope.isContactMethodRequiredAtSignup;
  };

  $scope.hasValidEmail = function () {
    if (!$scope.shouldOfferEmailAtSignup()) {
      return true;
    }

    if (!$scope.signup.email) {
      return false;
    }
    const re = new RegExp($scope.emailRegex);
    return re.test($scope.signup.email);
  };

  $scope.shouldShowEmailField = function () {
    return $scope.shouldOfferEmailAtSignup() && $scope.contactMethodIsEmail;
  };

  $scope.getEmailPlaceholderText = function () {
    return $scope.isUnder13()
      ? languageResource.get('Label.EmailRequirementsUnder13')
      : languageResource.get('Label.Email');
  };

  $scope.getEmailLabelText = function () {
    const isUnder13 = $scope.isUnder13();

    if ($scope.isParentEmailForKoreaUserEnabled()) {
      return languageResource.get('Label.EmailRequirementsUnder13');
    }

    return isUnder13
      ? languageResource.get('Label.EmailRequirementsUnder13')
      : languageResource.get('Label.Email');
  };

  $scope.getSwitchToPhoneText = function () {
    return `${languageResource.get('Action.UsePhoneNumber')} →`;
  };

  /* END EMAIL FUNCTIONS */

  /* START PHONE NUMBER FUNCTIONS */
  $scope.shouldShowPhoneNumberField = function () {
    if (!$scope.canChooseEmailOrPhoneNumberAtSignup()) {
      return false;
    }
    return !$scope.contactMethodIsEmail;
  };

  $scope.getPhoneLabelText = function () {
    return languageResource.get('Label.PhoneNumber');
  };

  $scope.getSwitchToEmailText = function () {
    return `${languageResource.get('Action.UseEmail')} →`;
  };

  $scope.hasValidPhoneNumber = function () {
    // User input, must be a minimum of 4 characters and
    // can only contain digits and special characters
    // xxxxxxxxxx, xxx-xxx-xxxx, xx xxx xxx, etc
    return (
      $scope.isContactMethodRequiredAtSignup &&
      phoneService.isPhoneNumber($scope.signup.phoneNumber)
    );
  };

  $scope.getPhonePrefixes = function () {
    phoneService.getPhonePrefixes(EnvironmentUrls.apiProxyUrl).then(function success(data) {
      $scope.phonePrefixes = data;

      // set default
      if ($scope.phonePrefixes) {
        $scope.signup.phonePrefix = $scope.phonePrefixes[0].prefix;
        $scope.signup.countryCode = $scope.phonePrefixes[0].code;
      }
    });
  };

  /* END PHONE NUMBER FUNCTIONS */

  $scope.togglePasswordVisibility = function () {
    let field;
    if ($scope.layout.showPassword) {
      $scope.layout.showPassword = false;
      $scope.layout.passwordInputType = signupConstants.inputType.password;
      field = signupConstants.events.fields.hidePassword;
    } else {
      $scope.layout.showPassword = true;
      $scope.layout.passwordInputType = signupConstants.inputType.text;
      field = signupConstants.events.fields.showPassword;
    }
    eventStreamService.sendEventWithTarget(
      signupConstants.events.buttonClick,
      $scope.signupForm.context,
      {
        field
      }
    );
  };

  // this function is only used to validate form with no contact method field.
  $scope.isFormValid = function () {
    return $scope.signupForm.$valid;
  };

  let wasPasswordBoxClicked = false;
  $scope.passwordBoxClicked = function () {
    wasPasswordBoxClicked = true;
  };

  $scope.getHintForUsername = function () {
    return $scope.badSubmit || $scope.signupForm.signupUsername.$dirty
      ? $scope.signupForm.signupUsername.$validationMessage
      : '';
  };

  $scope.getUsernamePlaceholder = function () {
    return Resources.AnimatedSignupFormValidator.usernameNoRealNameUse;
  };

  $scope.getPasswordPlaceholder = function () {
    return languageResource.get('Label.PasswordPlaceholder');
  };

  $scope.getHintForPassword = function () {
    if (!$scope.signup.password) {
      return '';
    }
    return $scope.badSubmit || $scope.signupForm.signupPassword.$dirty
      ? $scope.signupForm.signupPassword.$validationMessage
      : '';
  };

  $scope.hasEmailError = function () {
    if ($scope.badSubmit || $scope.signupForm.signupEmail.$dirty) {
      if ($scope.isBirthdayInvalid()) {
        return true;
      }
      if (!$scope.hasValidEmail()) {
        return true;
      }
    }
    return false;
  };

  $scope.getErrorMessageForEmail = function () {
    if ($scope.hasEmailError()) {
      if ($scope.isBirthdayInvalid()) {
        return Resources.AnimatedSignupFormValidator.birthdayRequired;
      }
      return Resources.AnimatedSignupFormValidator.invalidEmail;
    }
    return '';
  };

  $scope.hasPhoneNumberError = function () {
    if ($scope.badSubmit || $scope.signup.phoneNumber) {
      if ($scope.isBirthdayInvalid()) {
        return true;
      }
      if (!$scope.hasValidPhoneNumber()) {
        return true;
      }
    }
    return false;
  };

  $scope.getErrorMessageForPhone = function () {
    if ($scope.hasPhoneNumberError()) {
      if ($scope.isBirthdayInvalid()) {
        return Resources.AnimatedSignupFormValidator.birthdayRequired;
      }
      return Resources.AnimatedSignupFormValidator.invalidPhone;
    }
    return '';
  };

  $scope.hasContactMethodError = function () {
    if ($scope.contactMethodIsEmail) {
      return $scope.hasEmailError();
    }
    return $scope.hasPhoneNumberError();
  };

  $scope.hasValidContactMethod = function () {
    if ($scope.contactMethodIsEmail) {
      return $scope.hasValidEmail();
    }
    return $scope.hasValidPhoneNumber();
  };

  $scope.setGeneralError = function (text) {
    $scope.signupForm.$generalError = true;
    $scope.signupForm.$generalErrorText = text;
  };

  $scope.showIdentityVerificationTokenErrorModal = function () {
    const modal = modalService.open({
      titleText: languageResource.get('Title.VerificationError'),
      bodyText: languageResource.get('Description.VerificationNotComplete'),
      neutralButtonText: languageResource.get('Action.TryAgain'),
      onNeutral: ReactIdentityVerificationUtils.identityVerificationResultTokenErrorHandler
    });
    modal.result.then(
      function () {},
      function () {
        ReactIdentityVerificationUtils.identityVerificationResultTokenErrorHandler();
      }
    );
  };

  $scope.handleSignupForbiddenErrors = function (response) {
    let numberOfReasonsHandled = 0;
    const errorReasons = response?.reasons || response?.errors[0]?.message;
    if (errorReasons.indexOf('Captcha') !== -1) {
      const inputParams = { unifiedCaptchaId: '', dataExchange: '' };
      if (response.errors && response.errors.length > 0 && response.errors[0].fieldData) {
        const dataArray = response.errors[0].fieldData.split(',');
        // Need this check for backward compatibility with the backend version
        // that doesn't support captcha id.
        if (dataArray.length == 1) {
          inputParams.dataExchange = response.errors[0].fieldData;
        }
        if (dataArray.length == 2) {
          const [captchaId, dxBlob] = dataArray;
          inputParams.unifiedCaptchaId = captchaId;
          inputParams.dataExchange = dxBlob;
        }
      }
      handleCaptcha(inputParams);
      numberOfReasonsHandled += 1;
    }
    if (errorReasons.indexOf('PasswordInvalid') !== -1) {
      $scope.signupForm.signupPassword.$setValidity('password', false);
      // TODO: Clean up all of these legacy password message fields.
      $scope.signupForm.signupPassword.$passwordMessage = 'Password is invalid';
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.passwordInvalid);
      numberOfReasonsHandled += 1;
      // Save the failed password from server so we can prompt the user when they are trying to use
      // it again.
      $scope.signupForm.signupPassword.$passwordThatFailedServerCheck = $scope.signup.password;
    }
    if (errorReasons.indexOf('UsernameInvalid') !== -1) {
      $scope.signupForm.signupUsername.$setValidity('validusername', false);
      $scope.signupForm.signupUsername.$usernameMessage = 'Username is invalid';
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.usernameInvalid);
      numberOfReasonsHandled += 1;
    }
    if (errorReasons.indexOf('UsernameTaken') !== -1) {
      $scope.signupForm.signupUsername.$setValidity('unique', false);
      $scope.signupForm.signupUsername.$usernameMessage = 'Username is taken';
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.usernameTaken);
      numberOfReasonsHandled += 1;
    }
    if (errorReasons.indexOf('InvalidIdentityVerificationResultToken') !== -1) {
      ReactLandingEventService.incrementEphemeralCounter(
        signupConstants.counters.identityVerificationResultTokenInvalid
      );
      numberOfReasonsHandled += 1;
      $scope.showIdentityVerificationTokenErrorModal();
    }

    if (errorReasons.indexOf('IdentityVerificationFailed') !== -1) {
      ReactLandingEventService.incrementEphemeralCounter(
        signupConstants.counters.identityVerificationFailed
      );
      numberOfReasonsHandled += 1;
      $scope.showIdentityVerificationTokenErrorModal();
    }

    const errorCount = typeof errorReasons === 'string' ? 1 : errorReasons?.length || 0;
    if (numberOfReasonsHandled < errorCount) {
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.unknownError);
      $scope.setGeneralError(signupConstants.generalErrorText);
    }
  };

  $scope.badSubmit = false;

  $scope.submitSignup = function (isUserTriggered, captchaData) {
    if (isUserTriggered) {
      ReactLandingEventService.sendSignupButtonClickEvent();
    }

    if ($scope.isSignupBlockedByTermsCheckbox()) {
      $scope.badSubmit = true;
      $scope.shouldShowTermsError = true;
      signupService.sendSignupEvent(events.termsCheckboxErrorShown);
      return;
    }
    if (
      !$scope.isFormValid() ||
      !ReactSignupUtils.isValidBirthday(
        $scope.signup.birthdayYear,
        $scope.signup.birthdayMonth,
        $scope.signup.birthdayDay
      ) ||
      !$scope.hasValidContactMethod()
    ) {
      $scope.badSubmit = true;
      return;
    }
    $scope.badSubmit = false;

    if ($scope.hasValidPhoneNumber() && !$scope.contactMethodIsEmail && !$scope.signup.voucher) {
      const phoneNumberParams = {
        phonePrefix: $scope.signup.phonePrefix,
        phoneNumber: $scope.signup.phoneNumber,
        countryCode: $scope.signup.countryCode
      };
      return PhoneNumberVerificationService?.handlePhoneNumberVerificationAtSignup(
        phoneNumberParams,
        handleUsePhoneCallback,
        handleUseEmailCallback
      );
    }

    $scope.layout.isSubmitting = true;

    if (isUserTriggered) {
      ReactLandingEventService.incrementSignUpSubmitCounters($scope.layout.isFirstSignUpSubmit);
      $scope.layout.isFirstSignUpSubmit = false;
    }

    const birthday = `${$scope.signup.birthdayDay} ${$scope.signup.birthdayMonth} ${$scope.signup.birthdayYear}`;

    const signUpParams = {
      username: $scope.signup.username,
      password: $scope.signup.password,
      voucher: $scope.signup.voucher,
      birthday,
      gender: $scope.signup.gender,
      isTosAgreementBoxChecked: true,
      context: $scope.signupForm.context
    };

    const locale = ReactSignupUtils.getLocale();

    if (locale) {
      signUpParams.locale = locale;
    }

    if ($scope.signup.email) {
      signUpParams.email = $scope.signup.email;
    }

    if (captchaData != null) {
      signUpParams.captchaId = captchaData.captchaId;
      signUpParams.captchaToken = captchaData.captchaToken;
      signUpParams.captchaProvider = captchaData.captchaProvider;
    }

    if (
      $scope.isUserAgreementsSignupIntegrationEnabled &&
      Array.isArray($scope.agreementIds) &&
      $scope.agreementIds.length > 0
    ) {
      signUpParams.agreementIds = $scope.agreementIds;
    }

    const identityVerificationResultToken = localStorageService.getLocalStorage(
      signupConstants.identityVerificationResultToken
    );
    if (identityVerificationResultToken) {
      signUpParams.identityVerificationResultToken = identityVerificationResultToken;
    }

    // deprioritize Auth.returnUrl since it is set only in loginService
    const returnUrlValue = $scope.returnUrl || (Auth && Auth.returnUrl);

    if (signUpParams.voucher && !$scope.contactMethodIsEmail) {
      // only use verified signup when contact method is phone
      signupService.verifiedSignup(signUpParams).then(
        function (result) {
          ReactSignupUtils.handlePostSignup(returnUrlValue);
        },
        function (result) {
          $scope.handleSignupError(result.data, result.status);
        }
      );
    } else {
      ReactSignupService.signup(signUpParams).then(
        function success(result) {
          ReactSignupUtils.handlePostSignup(returnUrlValue);
        },
        function error(result) {
          $scope.handleSignupError(result.data, result.status);
        }
      );
    }
  };

  $scope.handleSignupError = function (data, status) {
    $scope.badSubmit = true;
    $scope.layout.isSubmitting = false;

    if (status === 403) {
      $scope.handleSignupForbiddenErrors(data);
    } else if (status === 429) {
      $scope.setGeneralError(languageResource.get(signupConstants.unknownErrorTranslationKey));
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.tooManyAttempts);
    } else if (
      data.reasons.some(
        reason => reason === signupConstants.userAgreementsInsertAcceptancesFailureReason
      )
    ) {
      $scope.setGeneralError(
        languageResource.get(signupConstants.accountCreatedButLoginFailedTranslationKey)
      );
    } else {
      // if signup fails, we cannot reuse this voucher
      $scope.signup.voucher = null;
      $scope.setGeneralError();
      ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.unknownError);
    }
    $scope.$apply();
  };

  function handleUsePhoneCallback() {
    $scope.switchToPhone();
    $scope.layout.isSubmitting = false;
    $scope.badSubmit = false;
    $scope.$apply();
  }

  function handleUseEmailCallback() {
    $scope.switchToEmail();
    $scope.layout.isSubmitting = false;
    $scope.badSubmit = false;
    $scope.$apply();
  }

  function handleCaptcha(inputParams) {
    $scope.captchaReturnTokenInSuccessCb = true;
    $scope.captchaInputParams = inputParams;
    $scope.captchaActivated = true;
    $scope.layout.isSubmitting = true;
    ReactLandingEventService.incrementEphemeralCounter(signupConstants.counters.captcha);

    const event = new CustomEvent('CaptchaDataOptionsUpdated', {
      detail: {
        inputParams
      }
    });
    window.dispatchEvent(event);
  }

  window.addEventListener(
    'ReactCaptchaSuccess',
    event => {
      const captchaData = event.detail.data;
      $scope.handleCaptchaSuccess(captchaData);
    },
    false
  );

  window.addEventListener(
    'ReactCaptchaError',
    event => {
      const { errorCode } = event.detail;
      $scope.handleCaptchaError(errorCode);
    },
    false
  );

  window.addEventListener(
    'ReactCaptchaDismiss',
    () => {
      $scope.handleCaptchaDismiss();
    },
    false
  );

  function logEvent(event) {
    window.EventTracker && window.EventTracker.fireEvent(event);
  }

  $scope.isKoreaAdultUser = function () {
    return !$scope.isPrefilledBirthdayUnder18 && $scope.isKoreaIdVerificationEnabled;
  };

  $scope.init();
}

landingPageModule.controller('signupController', signupController);

export default signupController;
