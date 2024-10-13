import React, { createRef, useState, useEffect, useMemo, useRef } from 'react';
import { withTranslations, WithTranslationsProps, useDebounce } from 'react-utilities';
import { Loading } from 'react-style-guide';
import {
  AccountIntegrityChallengeService,
  CaptchaConstants,
  EmailVerifyCodeModalService,
  AccountSwitcherService,
  Cookies,
  NavigationService
} from 'Roblox';

import { dataStores, localStorageService } from 'core-roblox-utilities';
import { urlService } from 'core-utilities';
import { authenticatedUser } from 'header-scripts';
import { signupTranslationConfig } from '../translation.config';
import useBackButtonHandler from '../../common/hooks/useBackButtonHandler';

// components
import GenderPicker from '../components/GenderPicker';
import BirthdayPicker from '../components/BirthdayPicker';
import UsernameInput from '../components/UsernameInput';
import PasswordInput from '../components/PasswordInput';
import LegalText from '../components/LegalText';
import CaptchaComponent from '../../common/components/CaptchaComponent';
import EmailInput from '../components/EmailInput';
import IdVerificationHelpText from '../components/IdVerificationHelpText';
import IdVerificationErrorModal from '../components/IdVerificationErrorModal';
import VPCSignupFormHeader from '../components/VPCSignupFormHeader';

// utils
import { getFirstDatePart, getOrderedBirthdaySelects } from '../utils/birthdayUtils';
import { isUnderThresholdAgeForCountry } from '../../common/utils/complianceUtils';
import {
  isValidBirthday,
  getUsernameValidationMessage,
  getPasswordValidationMessage,
  getLocale,
  handlePostSignup,
  getReturnUrl,
  getBirthdayToPrefill,
  getIsSignupButtonDisabled,
  isVerifiedParentConsentSignup,
  getDataToken,
  getActiveUserBirthdayToPrefill,
  handleEmptyAccountSwitchBlobRequired,
  isVerifiedParentalConsentDecompSignup
} from '../utils/signupUtils';
import { isUnderThresholdAge } from '../utils/identityVerificationUtils';
import { isValidEmail } from '../../common/utils/formUtils';
import { parseErrorCode, fetchReturnUrl } from '../../common/utils/requestUtils';
import { parseCaptchaData } from '../../common/utils/errorParsingUtils';

// services
import {
  incrementEphemeralCounter,
  incrementSignUpSubmitCounters,
  sendSignupButtonClickEvent,
  sendUsernameValidationErrorEvent,
  sendPasswordValidationEvent,
  sendEmailValidationEvent,
  sendShowPasswordButtonClickEvent,
  sendHidePasswordButtonClickEvent,
  sendTosCheckboxClickEvent,
  sendPrivacyPolicyboxClickEvent,
  sendUsernameValidationSuccessEvent,
  sendVPCSignupPageLoadEvent,
  sendVPCSignupButtonClickedEvent,
  sendShowVPCLogoutPopupEvent,
  sendClickVPCLogoutPopupLogoutEvent,
  sendSignupUsernameKeystrokeEvent
} from '../services/eventService';
import { signup, getMetadataV2, getUserAgreements } from '../services/signupService';
import logoutService from '../../common/services/logoutService';

// constants
import {
  signupFormStrings,
  validationMessages,
  counters,
  errorCodes,
  monthStrings,
  reactSignupCaptchaContainer,
  identityVerificationResultTokenName,
  birthdayPickerConstants,
  otpModalConstants,
  USER_AGREEMENTS,
  reactSignupAccountLimitContainer,
  complianceConstants,
  requestTypeParam,
  sessionIdParam,
  arbitraryLargePrimeNumber,
  maxKeystrokeDataLength,
  keystrokeSampleRate
} from '../constants/signupConstants';
import { FeatureSignupComplianceModal } from '../../common/constants/translationConstants';
import { logoutMessage, invalidParentLinkMessage } from '../../common/constants/commonConstants';
import VerifiedParentalConsentRequestType from '../enums/VerifiedParentalConsentRequestType';
// types
import {
  GenderType,
  FormFieldStatus,
  TSignupParams,
  KoreaSignupCompliancePolicyCheckboxType
} from '../../common/types/signupTypes';
import {
  TCaptchaInputParams,
  TOnCaptchaChallengeCompletedData,
  TOnCaptchaChallengeInvalidatedData
} from '../../common/types/captchaTypes';
import { EmailVerifyCodeModalParams, IOtpSession } from '../../emailVerifyCodeModal/interface';

// hooks
import useOtpMetadata from '../../common/hooks/useOtpMetadata';
import useIntlAuthCompliance from '../../common/hooks/useIntlAuthCompliance';
import useInfoModal from '../../common/hooks/useInfoModal';

// hardware backed authentication util
import { buildAuthParamsWithSecureAuthIntentAndClientKeyPair } from '../../common/hardwareBackedAuth/utils/requestUtils';
import TosCheckbox from '../components/TosCheckbox';
import PrivacyPolicyCheckbox from '../components/PrivacyPolicyCheckbox';
import AccountSwitcherRestrictionComponent from '../../common/components/AccountSwitcherRestrictionComponent';
import { navigateToPage, navigateToLogin } from '../../common/utils/browserUtils';
import useLoggedInUsers from '../../common/hooks/useLoggedInUsers';
import useRedirectHomeIf from '../../common/hooks/useRedirectHomeIf';
import { confirmationModalOrigins } from '../../accountSwitcher/constants/accountSwitcherConstants';
import KoreaSignupComplianceComponent from '../components/KoreaSignupComplianceComponent';

interface SignupFormContainerProps {
  isEligibleForUsernameSuggestionExperiment: boolean;
  translate: WithTranslationsProps['translate'];
}

type UserAgreementId = {
  id: string;
  agreementType: string;
};

export const SignupFormContainer: React.FC<SignupFormContainerProps> = ({
  translate,
  isEligibleForUsernameSuggestionExperiment
}): JSX.Element => {
  // birthday states
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [birthdayStatus, setBirthdayStatus] = useState(FormFieldStatus.Incomplete);
  const [birthdayErrorMessage, setBirthdayErrorMessage] = useState('');
  const [isBirthdayDisabled, setIsBirthdayDisabled] = useState(false);

  // email states only used for korea id flow
  const [email, setEmail] = useState('');
  const [
    shouldShowKoreaSignupComplianceCheckboxPage,
    setShouldShowKoreaSignupComplianceCheckboxPage
  ] = useState(false);
  const [emailStatus, setEmailStatus] = useState(FormFieldStatus.Incomplete);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [
    isKoreaSingupCompliancePoliciesAgreed,
    setIsKoreaSingupCompliancePoliciesAgreed
  ] = useState(false);
  const [koreaPoliciesType, setKoreaPoliciesType] = useState(
    KoreaSignupCompliancePolicyCheckboxType.Optional
  );
  const [isUnderThresholdAgeForKorea, setIsUnderThresholdAgeForKorea] = useState(false);

  // VPC signup
  const isVPCSignup = isVerifiedParentConsentSignup();
  const isVPCDecomp = isVerifiedParentalConsentDecompSignup();
  const dataToken = getDataToken();
  const requestType = urlService.getQueryParam(
    requestTypeParam
  ) as VerifiedParentalConsentRequestType;
  const vpcSessionId = urlService.getQueryParam(sessionIdParam) as string;

  // username states
  const [username, setUsername] = useState('');
  // prevent unnecessary calls to validateUsername endpoint
  const debouncedUsername = useDebounce(username, 200);
  const [usernameStatus, setUsernameStatus] = useState(FormFieldStatus.Incomplete);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [
    isUsernameInputEligibleForUsernameSuggestion,
    setIsUsernameInputEligibleForUsernameSuggestion
  ] = useState(false);
  // password states
  const [password, setPassword] = useState('');
  const debouncedPassword = useDebounce(password, 200);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(FormFieldStatus.Incomplete);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordThatFailedServerCheck, setPasswordThatFailedServerCheck] = useState('');

  // gender state
  const [gender, setGender] = useState(GenderType.unknown);

  // form state
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstSignUpSubmit, setIsFirstSignUpSubmit] = useState(true);
  const [isUserAgreementsEnabled, setIsUserAgreementsEnabled] = useState(false);
  const [locale, setLocale] = useState('');
  const [isKoreaIdUser, setIsKoreaIdUser] = useState(false);
  const [hasIdVerificationError, setHasIdVerificationError] = useState(false);
  const [isVPCTokenInvalid, setIsVPCTokenInvalid] = useState(false);

  // captcha state
  const [unifiedCaptchaId, setUnifiedCaptchaId] = useState('');
  const [dataExchange, setDataExchange] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');

  // compliance state
  const [isTosChecked, setIsTosChecked] = useState(false);
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false);

  // account switch
  const [
    isAccountSwitchingEnabledForBrowser,
    isAccountSwitcherHookCompleted
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false, false];
  const [hasMaxLoggedInAccountsSignupError, setHasMaxLoggedInAccountsSignupError] = useState(false);
  const { loggedInUsers, isGettingLoggedInUsers } = useLoggedInUsers(false); // does not fetch usersInfo
  const [isParentError, setIsParentError] = useState(false);

  // alt state
  const [isAltAttempt, setIsAltAttempt] = useState(false);
  // page state
  const [isNavigating, setIsNavigating] = useState(false);

  const userAgreementIds = useMemo(() => [] as UserAgreementId[], []);

  const [otpSession, setOtpSession] = useState({} as IOtpSession);
  const { otpCodeLength, isOtpEnabled } = useOtpMetadata(otpModalConstants.origin);
  const {
    verifiedSignupCountry,
    parentalConsentId,
    shouldEnableStrictCompliance,
    shouldEnableKoreaEnhancedCompliance
  } = useIntlAuthCompliance();

  // refs for accessibility purposes
  const birthdayDayRef: React.RefObject<HTMLSelectElement> = createRef();
  const birthdayMonthRef: React.RefObject<HTMLSelectElement> = createRef();
  const birthdayYearRef: React.RefObject<HTMLSelectElement> = createRef();
  const emailRef: React.RefObject<HTMLInputElement> = createRef();
  const usernameRef: React.RefObject<HTMLInputElement> = createRef();
  const passwordRef: React.RefObject<HTMLInputElement> = createRef();

  // birthday methods
  const prefillBirthday = (birthdayToPrefill: string, shouldLockBirthdayForU18: boolean) => {
    if (birthdayToPrefill) {
      const birthday = new Date(birthdayToPrefill);
      // add leading zero to signle digit birthday date
      setDay(`0${birthday.getDate().toString()}`.slice(-2));
      // get short version of month eg 'Mar' for March
      setMonth(monthStrings[birthday.getMonth()].slice(6, 9));
      setYear(birthday.getFullYear().toString());

      if (shouldLockBirthdayForU18) {
        // lock birthday if user < 18
        const now = new Date();
        const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
        if (now.getTime() - birthday.getTime() < now.getTime() - eighteenYearsAgo.getTime()) {
          setIsBirthdayDisabled(true);
        }
      }
    }
  };

  const handleBirthdayChange = (isFromSubmit: boolean): void => {
    if ((year && month && day) || isFromSubmit) {
      if (isValidBirthday(year, month, day)) {
        setBirthdayStatus(FormFieldStatus.Valid);
        setBirthdayErrorMessage('');
        setIsUnderThresholdAgeForKorea(
          isUnderThresholdAgeForCountry(year, month, day, verifiedSignupCountry)
        );
      } else {
        setBirthdayStatus(FormFieldStatus.Invalid);
        setBirthdayErrorMessage(validationMessages.birthdayInvalid);
      }
    }
  };

  const exitModal = useBackButtonHandler(translate);
  const [logoutModal, logoutModalService] = useInfoModal({
    translate,
    titleTranslationKey: logoutMessage.title,
    bodyTranslationKey: logoutMessage.body,
    actionButtonTextTranslationKey: logoutMessage.actionBtnText,
    onAction: async () => {
      sendClickVPCLogoutPopupLogoutEvent(requestType, vpcSessionId);
      try {
        await logoutService.logout();
      } catch (error) {
        setGeneralError(validationMessages.unknownError);
      }
    },
    closeable: false
  });
  const [tokenInvalidModal, tokenInvalidModalService] = useInfoModal({
    translate,
    titleTranslationKey: invalidParentLinkMessage.title,
    bodyTranslationKey: invalidParentLinkMessage.body,
    actionButtonTextTranslationKey: invalidParentLinkMessage.actionBtnText
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isVNGComplianceEnabled = await NavigationService?.getIsVNGLandingRedirectEnabled();
        // if VNG landing page redirect is enabled, we don't want to show any signup UI unless the user is switching accounts
        if (!authenticatedUser?.isAuthenticated && isVNGComplianceEnabled) {
          navigateToLogin();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
  }, [authenticatedUser.isAuthenticated]);

  useEffect(() => {
    handleBirthdayChange(false);
  }, [year, month, day]);

  // email methods
  const handleEmailValidation = () => {
    if (isValidEmail(email)) {
      setEmailErrorMessage('');
      setEmailStatus(FormFieldStatus.Valid);
    } else {
      setEmailErrorMessage(validationMessages.invalidEmail);
      setEmailStatus(FormFieldStatus.Invalid);
      sendEmailValidationEvent(email, validationMessages.invalidEmail);
    }
  };

  useEffect(() => {
    if (email || emailStatus !== FormFieldStatus.Incomplete) {
      handleEmailValidation();
    }
  }, [email]);
  // username methods
  interface KeystrokeEvent {
    key: string;
    eventType: number;
    timestamp: number;
  }
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeEvent[]>([]);
  const sampleRate = Math.round(1 / keystrokeSampleRate);
  const browserTrackerId = Cookies.getBrowserTrackerId().toString();
  const parsedBtid = parseInt(browserTrackerId, 10);
  const shouldSample = useMemo(() => {
    return !Number.isNaN(parsedBtid) && (parsedBtid * arbitraryLargePrimeNumber) % sampleRate === 0;
  }, [parsedBtid, sampleRate]);
  const handleKeyStroke = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shouldSample) {
      return;
    }
    const now = Date.now();
    const eventType = event.type === 'keyup' ? 1 : 0;

    const keystrokeEvent: KeystrokeEvent = {
      key: event.key,
      eventType,
      timestamp: now
    };
    if (keystrokeData.length < maxKeystrokeDataLength) {
      setKeystrokeData(prevData => [...prevData, keystrokeEvent]);
    }
  };

  function splitKeystrokeData(
    data: KeystrokeEvent[]
  ): {
    keyPressedData: string[];
    eventTypeData: number[];
    timestampData: number[];
  } {
    const keyPressedData: string[] = [];
    const eventTypeData: number[] = [];
    const timestampData: number[] = [];

    data.forEach(event => {
      keyPressedData.push(event.key);
      eventTypeData.push(event.eventType);
      timestampData.push(event.timestamp);
    });

    return { keyPressedData, eventTypeData, timestampData };
  }
  function sendKeystrokeEvents() {
    if (!shouldSample) {
      return;
    }
    const { keyPressedData, eventTypeData, timestampData } = splitKeystrokeData(keystrokeData);
    sendSignupUsernameKeystrokeEvent(
      JSON.stringify(keyPressedData),
      JSON.stringify(eventTypeData),
      JSON.stringify(timestampData)
    );
    setKeystrokeData([]);
  }
  const handleUsernameValidation = async () => {
    const validationMessage: string = await getUsernameValidationMessage(
      username,
      day,
      month,
      year
    );
    setUsernameErrorMessage(validationMessage);
    setIsUsernameInputEligibleForUsernameSuggestion(
      validationMessage === validationMessages.usernameAlreadyInUse
    );
    if (validationMessage) {
      setUsernameStatus(FormFieldStatus.Invalid);
      sendUsernameValidationErrorEvent(username, translate(validationMessage));
    } else {
      setUsernameStatus(FormFieldStatus.Valid);
      sendKeystrokeEvents();
      sendUsernameValidationSuccessEvent();
    }
  };

  useEffect(() => {
    // do not trigger username validation until username is present, or had been filled earlier
    if (username || usernameStatus !== FormFieldStatus.Incomplete) {
      // eslint-disable-next-line no-void
      void handleUsernameValidation();
    }
  }, [debouncedUsername, year, month, day]);

  // password methods
  const togglePasswordVisibility = (): void => {
    // if passwordVisibility is true, then toggling will hide password
    if (passwordVisibility) {
      sendHidePasswordButtonClickEvent();
    } else {
      sendShowPasswordButtonClickEvent();
    }
    setPasswordVisibility(!passwordVisibility);
  };

  const handlePasswordValidation = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validationMessage: string | null = await getPasswordValidationMessage(
      username,
      password,
      passwordThatFailedServerCheck,
      verifiedSignupCountry
    )!;

    if (validationMessage) {
      setPasswordStatus(FormFieldStatus.Invalid);
      sendPasswordValidationEvent(translate(validationMessage));
    } else {
      setPasswordStatus(FormFieldStatus.Valid);
    }
    if (validationMessage != null) {
      setPasswordErrorMessage(validationMessage);
    }
  };

  useEffect(() => {
    if (password || passwordStatus !== FormFieldStatus.Incomplete) {
      // eslint-disable-next-line no-void
      void handlePasswordValidation();
    }
  }, [debouncedUsername, debouncedPassword]);

  // needed so that clicking a gender that is already selected deselects the current gender
  const setSelectedGender = (newGender: number): void => {
    if (gender === newGender) {
      setGender(GenderType.unknown);
    } else {
      setGender(newGender);
    }
  };

  // The captcha handler upon triggering the challenge
  const handleCaptchaDataUpdated = (data: TCaptchaInputParams) => {
    setUnifiedCaptchaId(data.unifiedCaptchaId);
    setDataExchange(data.dataExchange);
  };

  const handleCaptchaError = (error: unknown) => {
    const captchaData: TCaptchaInputParams = parseCaptchaData(error);
    incrementEphemeralCounter(counters.captcha);
    handleCaptchaDataUpdated(captchaData);
  };

  // The captcha handler when the challenge is completed
  const handleCaptchaChallengeCompleted = (data: TOnCaptchaChallengeCompletedData) => {
    setCaptchaId(data.captchaId);
    setCaptchaToken(data.captchaToken);
  };

  const clearDependencyData = () => {
    // reset captcha
    setDataExchange('');
    setUnifiedCaptchaId('');
    // reset otp token
    setOtpSession({} as IOtpSession);
    // reset isSubmitting
    setIsSubmitting(false);
  };

  // The captcha handler when system errors are returned from the service
  const handleCaptchaChallengeInvalidated = (data: TOnCaptchaChallengeInvalidatedData) => {
    switch (data.errorCode) {
      case CaptchaConstants.errorCodes.failedToLoadProviderScript:
        setGeneralError(validationMessages.captchaFailedToLoad);
        return;
      case CaptchaConstants.errorCodes.failedToVerify:
        setGeneralError(validationMessages.captchaFailedToVerify);
        return;
      default:
        setGeneralError(validationMessages.unknownError);
    }
  };

  const isFormValid = (): boolean => {
    if (
      isKoreaIdUser &&
      isUnderThresholdAge(18, year, month, day) &&
      emailStatus !== FormFieldStatus.Valid
    ) {
      return false;
    }

    if (isVPCSignup) {
      return birthdayStatus === FormFieldStatus.Valid && !isVPCTokenInvalid;
    }
    const agreementsChecked =
      shouldEnableStrictCompliance && !shouldEnableKoreaEnhancedCompliance
        ? isTosChecked && isPrivacyPolicyChecked
        : true;
    return (
      birthdayStatus === FormFieldStatus.Valid &&
      usernameStatus === FormFieldStatus.Valid &&
      passwordStatus === FormFieldStatus.Valid &&
      agreementsChecked
    );
  };

  const handleUserAgreements = async () => {
    const userAgreementsResponse = await getUserAgreements();
    if (userAgreementsResponse && userAgreementsResponse.length > 0) {
      userAgreementsResponse.forEach(agreement => {
        // If ParentalConsent exist, it will be added after the parental consent modal flow is finished.
        if (agreement.agreementType !== USER_AGREEMENTS.ParentalConsent) {
          userAgreementIds.push({ id: agreement.id, agreementType: agreement.agreementType });
        }
      });
    }
  };

  const handleGetMetadata = async () => {
    const metadataResponse = await getMetadataV2();
    if (metadataResponse && metadataResponse.IsAltBrowserTracker) {
      setIsAltAttempt(true);
    }
    if (metadataResponse && metadataResponse.IsUserAgreementsSignupIntegrationEnabled) {
      setIsUserAgreementsEnabled(true);
      // eslint-disable-next-line no-void
      void handleUserAgreements();
    }
  };

  // handle compliance checkbox
  const handleTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTosChecked(e.target.checked);
    sendTosCheckboxClickEvent(e.target.checked);
  };
  const handlePrivacyPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyPolicyChecked(e.target.checked);
    sendPrivacyPolicyboxClickEvent(e.target.checked);
  };

  // TODO: clean up korean Id flow
  useEffect(() => {
    // eslint-disable-next-line no-void
    void handleGetMetadata();
    const currentLocale = getLocale();
    if (currentLocale) {
      setLocale(currentLocale);
    }
    // TODO: the korean id flow is deprecated and should be cleaned up.
    const birthdayString = getBirthdayToPrefill();
    if (birthdayString) {
      prefillBirthday(birthdayString, true);
      setIsKoreaIdUser(true);
    }
  }, []);

  useEffect(() => {
    // this is from active user for account switching
    const activeUserBirthday = getActiveUserBirthdayToPrefill();
    if (
      isAccountSwitchingEnabledForBrowser &&
      authenticatedUser.isAuthenticated &&
      activeUserBirthday
    ) {
      prefillBirthday(activeUserBirthday, false);
    }
    if (isVPCSignup) {
      sendVPCSignupPageLoadEvent(requestType, vpcSessionId);
      if (!isAccountSwitchingEnabledForBrowser && authenticatedUser.isAuthenticated) {
        // account switcher has another modal for logout all users
        // this modal is only for when account switcher is not enabled
        sendShowVPCLogoutPopupEvent(requestType, vpcSessionId);
        logoutModalService.open();
      } else {
        logoutModalService.close();
      }
    }
  }, [isAccountSwitchingEnabledForBrowser]);

  useRedirectHomeIf(
    !isVPCSignup &&
      authenticatedUser.isAuthenticated &&
      isAccountSwitcherHookCompleted &&
      !isAccountSwitchingEnabledForBrowser
  );

  const focusFirstFieldWithError = () => {
    if (birthdayStatus !== FormFieldStatus.Valid) {
      const firstBirthdayDropdown = getFirstDatePart();
      switch (firstBirthdayDropdown) {
        case birthdayPickerConstants.day.name:
          birthdayDayRef.current?.focus();
          break;
        case birthdayPickerConstants.month.name:
          birthdayMonthRef.current?.focus();
          break;
        case birthdayPickerConstants.year.name:
          birthdayYearRef.current?.focus();
          break;
        default:
      }
    } else if (
      isKoreaIdUser &&
      isUnderThresholdAge(18, year, month, day) &&
      emailStatus !== FormFieldStatus.Valid
    ) {
      emailRef.current?.focus();
    } else if (usernameStatus !== FormFieldStatus.Valid) {
      usernameRef.current?.focus();
    } else if (passwordStatus !== FormFieldStatus.Valid) {
      passwordRef.current?.focus();
    }
  };

  const buildBirthday = (): Date => {
    return new Date(`${day} ${month} ${year}`);
  };

  const buildSignupParams = (): TSignupParams => {
    const birthday = buildBirthday();

    const signUpParams: TSignupParams = {
      username,
      password,
      birthday,
      gender,
      isTosAgreementBoxChecked: true
    };

    if (dataToken) {
      signUpParams.dataToken = dataToken;
    }

    if (email) {
      signUpParams.email = email;
    }

    if (locale) {
      signUpParams.locale = locale;
    }

    if (captchaId && captchaToken) {
      signUpParams.captchaId = captchaId;
      signUpParams.captchaToken = captchaToken;
    }

    if (isUserAgreementsEnabled && userAgreementIds.length > 0) {
      if (
        shouldEnableKoreaEnhancedCompliance &&
        koreaPoliciesType !== KoreaSignupCompliancePolicyCheckboxType.All
      ) {
        signUpParams.agreementIds = userAgreementIds
          .filter(
            agreement =>
              agreement.agreementType !== USER_AGREEMENTS.OptionalPersonalInformationPolicy
          )
          .map(agreement => agreement.id);
      } else {
        signUpParams.agreementIds = userAgreementIds.map(agreement => agreement.id);
      }
    }

    if (otpSession.otpSessionToken && otpSession.otpContactType) {
      signUpParams.otpSession = otpSession;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const identityVerificationResultToken = localStorageService.getLocalStorage(
      identityVerificationResultTokenName
    );
    if (identityVerificationResultToken) {
      signUpParams.identityVerificationResultToken = identityVerificationResultToken as string;
    }
    if (isAccountSwitchingEnabledForBrowser) {
      // attach accountBlob if it exists
      const accountBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob();
      if (accountBlob) {
        signUpParams.accountBlob = accountBlob;
      }
    }
    return signUpParams;
  };

  const handleSignupError = (error: unknown) => {
    const errorCode = parseErrorCode(error);
    let returnUrl = '';
    if (isVPCSignup) {
      returnUrl = fetchReturnUrl(error);
    }

    switch (errorCode) {
      case errorCodes.captcha:
        handleCaptchaError(error);
        return;
      case errorCodes.invalidBirthdate:
        setBirthdayStatus(FormFieldStatus.Invalid);
        setBirthdayErrorMessage(validationMessages.birthdayInvalid);
        break;
      case errorCodes.invalidUsername:
        setUsernameStatus(FormFieldStatus.Invalid);
        setUsernameErrorMessage(validationMessages.usernameInvalid);
        break;
      case errorCodes.usernameTaken:
        setUsernameStatus(FormFieldStatus.Invalid);
        setUsernameErrorMessage(validationMessages.usernameAlreadyInUse);
        break;
      case errorCodes.invalidPassword:
        setPasswordStatus(FormFieldStatus.Invalid);
        setPasswordErrorMessage(validationMessages.useDifferentPassword);
        setPasswordThatFailedServerCheck(password);
        break;
      case errorCodes.passwordSameAsUsername:
      case errorCodes.passwordTooSimple:
        setPasswordStatus(FormFieldStatus.Invalid);
        setPasswordErrorMessage(validationMessages.passwordInvalid);
        setPasswordThatFailedServerCheck(password);
        break;
      case errorCodes.invalidIdentityVerificationResultToken:
      case errorCodes.identityVerificationFailed:
        setHasIdVerificationError(true);
        return;
      case errorCodes.insertAcceptancesFailed:
        setGeneralError(validationMessages.accountCreatedButLoginFailed);
        break;
      case errorCodes.ageUnder13:
      case errorCodes.ageUnder18:
        navigateToPage(returnUrl);
        break;
      case errorCodes.emptyAccountSwitchBlobRequired:
        setIsParentError(false);
        handleEmptyAccountSwitchBlobRequired(
          () => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            handleSubmit(false);
          },
          translate,
          isParentError
        );
        break;
      case errorCodes.maxLoggedInAccountsLimitReached:
        setHasMaxLoggedInAccountsSignupError(true);
        break;
      case errorCodes.parentEmptyAccountSwitchBlobRequired:
        setIsParentError(false);
        handleEmptyAccountSwitchBlobRequired(
          () => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            handleSubmit(false);
          },
          translate,
          isParentError
        );
        break;
      default:
        // Ignore generic challenge abandons.
        if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
          break;
        }
        if (typeof error === 'object') {
          if ((error as Record<string, unknown>).status === errorCodes.tooManyAttepmts) {
            incrementEphemeralCounter(counters.tooManyAttempts);
          }
        }
        if (isVPCDecomp) {
          setIsVPCTokenInvalid(true);
          tokenInvalidModalService.open();
        } else {
          setGeneralError(validationMessages.unknownError);
        }
        break;
    }
    clearDependencyData();
    focusFirstFieldWithError();
  };

  const handleOtpComplete = (session: IOtpSession) => {
    if (parentalConsentId) {
      userAgreementIds.push({
        id: parentalConsentId,
        agreementType: USER_AGREEMENTS.ParentalConsent
      });
    }
    setOtpSession(session);
  };

  const shouldOpenOtpModal = (): boolean => {
    if (verifiedSignupCountry === complianceConstants.Korea.name) {
      setIsUnderThresholdAgeForKorea(
        isUnderThresholdAgeForCountry(year, month, day, verifiedSignupCountry)
      );
    }
    return (
      isOtpEnabled &&
      !otpSession.otpSessionToken &&
      shouldEnableStrictCompliance &&
      isUnderThresholdAgeForCountry(year, month, day, verifiedSignupCountry)
    );
  };

  const shouldShowKoreaCompliancePolicies = (): boolean => {
    return (
      shouldEnableStrictCompliance &&
      shouldEnableKoreaEnhancedCompliance &&
      !isUnderThresholdAgeForKorea &&
      !isKoreaSingupCompliancePoliciesAgreed
    );
  };

  const openOtpModal = (): void => {
    const {
      DescriptionSignupOtpModalLegalCheckboxLabel,
      HeadingVerifiedParentalConsentModalAddHeader,
      DescriptionEnterParentEmail,
      DescriptionVerifiedParentalConsentModalEnterCodeNoEmailReveal,
      LabelVerificationCode
    } = FeatureSignupComplianceModal;
    if (EmailVerifyCodeModalService && isOtpEnabled) {
      const params: EmailVerifyCodeModalParams = {
        containerId: otpModalConstants.otpSignupContainer,
        codeLength: otpCodeLength,
        onComplete: handleOtpComplete,
        onModalAbandoned: clearDependencyData,
        legalCheckboxLabel: translate(DescriptionSignupOtpModalLegalCheckboxLabel),
        enterEmailTitle: translate(HeadingVerifiedParentalConsentModalAddHeader),
        enterEmailDescription: translate(DescriptionEnterParentEmail),
        enterCodeTitle: translate(LabelVerificationCode),
        enterCodeDescription: translate(
          DescriptionVerifiedParentalConsentModalEnterCodeNoEmailReveal
        ),
        origin: otpModalConstants.origin,
        translate
      };
      EmailVerifyCodeModalService.renderEmailVerifyCodeModal(params);
    }
  };

  const signupWithParams = async (params: TSignupParams, returnUrlValue: string) => {
    try {
      const { authParams } = await buildAuthParamsWithSecureAuthIntentAndClientKeyPair(params);

      const result = await signup(authParams as TSignupParams);

      if (authParams.secureAuthenticationIntent) {
        incrementEphemeralCounter(counters.successWithSAI);
      }
      if (verifiedSignupCountry === complianceConstants.Vietnam.name) {
        incrementEphemeralCounter(counters.successWithVNG);
      }
      AccountSwitcherService?.storeAccountSwitcherBlob(
        result.accountBlob ? result.accountBlob : ''
      );
      if (isVPCSignup) {
        const returnUrl = result.returnUrl ?? '';
        await handlePostSignup(returnUrl);
      } else {
        await handlePostSignup(returnUrlValue, result.userId.toString());
      }
    } catch (error) {
      handleSignupError(error);
    }
  };

  const handleSubmit = (isUserTriggered: boolean) => {
    if (isVPCSignup) {
      sendVPCSignupButtonClickedEvent(requestType, vpcSessionId);
    }

    if (isUserTriggered && !isVPCSignup) {
      const {
        authIntentDataStore: { hasUnclaimedAuthIntent }
      } = dataStores || {};
      sendSignupButtonClickEvent(isAltAttempt, hasUnclaimedAuthIntent?.());
    }

    handleBirthdayChange(true);
    // eslint-disable-next-line no-void
    void handleUsernameValidation();
    // eslint-disable-next-line no-void
    void handlePasswordValidation();
    if (!isFormValid()) {
      focusFirstFieldWithError();
      return;
    }

    setIsSubmitting(true);

    if (isUserTriggered) {
      incrementSignUpSubmitCounters(isFirstSignUpSubmit);
      setIsFirstSignUpSubmit(false);
    }

    if (shouldOpenOtpModal()) {
      openOtpModal();
    } else if (shouldShowKoreaCompliancePolicies()) {
      setShouldShowKoreaSignupComplianceCheckboxPage(true);
    } else {
      const params = buildSignupParams();
      const returnUrlValue: string = getReturnUrl();
      // eslint-disable-next-line no-void
      void signupWithParams(params, returnUrlValue);
    }
  };

  const handleKoreaComplianceSignupAgreements = (
    agreementType: KoreaSignupCompliancePolicyCheckboxType
  ) => {
    setIsKoreaSingupCompliancePoliciesAgreed(true);
    setKoreaPoliciesType(agreementType);
  };

  const ComplianceComponent = () => {
    if (shouldEnableStrictCompliance && shouldEnableKoreaEnhancedCompliance) {
      return null;
    }

    if (shouldEnableStrictCompliance) {
      return (
        <div className='legal-text-container-top-margin'>
          <TosCheckbox
            locale={locale}
            translate={translate}
            isChecked={isTosChecked}
            onCheckBoxChanged={handleTosChange}
          />
          <PrivacyPolicyCheckbox
            locale={locale}
            translate={translate}
            isChecked={isPrivacyPolicyChecked}
            onCheckBoxChanged={handlePrivacyPolicyChange}
          />
        </div>
      );
    }
    return <LegalText locale={locale} translate={translate} />;
  };

  const handleAccountLimitConfirmation = () => {
    setIsNavigating(true);
    const returnUrl = getReturnUrl() || '/';
    navigateToPage(returnUrl);
  };

  useEffect(() => {
    if (captchaId && captchaToken) {
      handleSubmit(false);
    }
  }, [captchaId + captchaToken]);

  useEffect(() => {
    if (koreaPoliciesType === KoreaSignupCompliancePolicyCheckboxType.All) {
      // Todo intergate agreement IDs after exp.
    }
    if (koreaPoliciesType === KoreaSignupCompliancePolicyCheckboxType.Required) {
      // Todo intergate agreement IDs after exp.
    }
    if (isKoreaSingupCompliancePoliciesAgreed) {
      handleSubmit(false);
    }
  }, [isKoreaSingupCompliancePoliciesAgreed, koreaPoliciesType]);

  useEffect(() => {
    if (otpSession.otpSessionToken) {
      if (
        shouldEnableStrictCompliance &&
        shouldEnableKoreaEnhancedCompliance &&
        verifiedSignupCountry === complianceConstants.Korea.name
      ) {
        setShouldShowKoreaSignupComplianceCheckboxPage(true);
      } else {
        handleSubmit(false);
      }
    }
  }, [otpSession]);

  if (isGettingLoggedInUsers || isNavigating) {
    return <Loading />;
  }

  const signUpHeading = authenticatedUser.isAuthenticated
    ? signupFormStrings.HeadingCreateANewAccount
    : signupFormStrings.Heading;

  if (shouldShowKoreaSignupComplianceCheckboxPage) {
    return (
      <KoreaSignupComplianceComponent
        translate={translate}
        onComplete={handleKoreaComplianceSignupAgreements}
        isUnderThresholdAgeForCountry={isUnderThresholdAgeForKorea}
      />
    );
  }

  return (
    <div className='signup-container theme-bg rbx-login-form'>
      <div id='signup'>
        {!isVPCSignup && <h3 className='text-center signup-header'>{translate(signUpHeading)}</h3>}
        {isVPCSignup && <VPCSignupFormHeader translate={translate} />}
        <div className='signup-or-log-in new-username-pwd-rule'>
          <div className='signup-container'>
            {isKoreaIdUser && !isUnderThresholdAge(18, year, month, day) && (
              <IdVerificationHelpText />
            )}
            <div className='signup-input-area'>
              <BirthdayPicker
                orderedBirthdaySelects={getOrderedBirthdaySelects(
                  day,
                  month,
                  year,
                  e => setDay(e.target.value),
                  e => setMonth(e.target.value),
                  e => setYear(e.target.value),
                  birthdayDayRef,
                  birthdayMonthRef,
                  birthdayYearRef
                )}
                birthdayStatus={birthdayStatus}
                birthdayErrorMessage={birthdayErrorMessage}
                isBirthdayDisabled={isBirthdayDisabled || isSubmitting}
                translate={translate}
              />
              {isKoreaIdUser && isUnderThresholdAge(18, year, month, day) && (
                <EmailInput
                  email={email}
                  emailStatus={emailStatus}
                  handleEmailChange={setEmail}
                  emailErrorMessage={emailErrorMessage}
                  disabled={isSubmitting}
                  emailRef={emailRef}
                  translate={translate}
                />
              )}
              {!isVPCSignup && (
                <React.Fragment>
                  <UsernameInput
                    username={username}
                    usernameStatus={usernameStatus}
                    handleUsernameChange={setUsername}
                    usernameErrorMessage={usernameErrorMessage}
                    disabled={isSubmitting}
                    usernameRef={usernameRef}
                    isEligibleForUsernameSuggestion={
                      isEligibleForUsernameSuggestionExperiment &&
                      isUsernameInputEligibleForUsernameSuggestion
                    }
                    birthday={buildBirthday()}
                    handleKeyStroke={handleKeyStroke}
                    translate={translate}
                  />
                  <PasswordInput
                    password={password}
                    passwordStatus={passwordStatus}
                    handlePasswordChange={setPassword}
                    passwordErrorMessage={passwordErrorMessage}
                    passwordVisibility={passwordVisibility}
                    handlePasswordVisibilityToggle={togglePasswordVisibility}
                    disabled={isSubmitting}
                    passwordRef={passwordRef}
                    translate={translate}
                  />
                  <GenderPicker
                    gender={gender}
                    setSelectedGender={setSelectedGender}
                    translate={translate}
                  />
                </React.Fragment>
              )}
              <ComplianceComponent />
              <button
                id='signup-button'
                type='button'
                className='btn-primary-md signup-submit-button btn-full-width'
                name='signupSubmit'
                // function to check if signup button should be disabled is called on every state change
                disabled={getIsSignupButtonDisabled(isFormValid(), isSubmitting)}
                onClick={() => handleSubmit(true)}>
                {translate(
                  isVPCSignup ? signupFormStrings.CreateAccount : signupFormStrings.SignUp
                )}
              </button>
              <noscript>
                <div className='text-danger'>
                  <strong>{translate(validationMessages.javascriptRequired)}</strong>
                </div>
              </noscript>
              {generalError && (
                <div
                  role='button'
                  aria-label='dismiss general error'
                  tabIndex={0}
                  id='GeneralErrorText'
                  className='input-validation-large alert-warning font-bold'
                  aria-live='polite'
                  onClick={() => setGeneralError('')}>
                  {translate(generalError)}
                </div>
              )}
              {isVPCSignup && !isVPCDecomp && exitModal}
              {isVPCSignup && isVPCDecomp && logoutModal}
              {isVPCSignup && isVPCDecomp && tokenInvalidModal}
            </div>
            {unifiedCaptchaId && dataExchange && (
              <CaptchaComponent
                containerId={reactSignupCaptchaContainer}
                actionType={AccountIntegrityChallengeService.Captcha.ActionType.Signup}
                unifiedCaptchaId={unifiedCaptchaId}
                dataExchange={dataExchange}
                onCaptchaChallengeCompleted={handleCaptchaChallengeCompleted}
                onCaptchaChallengeInvalidated={handleCaptchaChallengeInvalidated}
                onCaptchaChallengeAbandoned={clearDependencyData}
                onUnknownError={() => handleSignupError(null)}
              />
            )}
            {isKoreaIdUser && (
              <IdVerificationErrorModal
                hasIdVerificationError={hasIdVerificationError}
                translate={translate}
              />
            )}
          </div>
        </div>
      </div>
      <AccountSwitcherRestrictionComponent
        origin={confirmationModalOrigins.SignupAccountLimit}
        containerId={reactSignupAccountLimitContainer}
        hasMaxLoggedInAccountsSignupError={hasMaxLoggedInAccountsSignupError}
        isAccountLimitReached={loggedInUsers.isAccountLimitReached}
        handleRedirectHome={handleAccountLimitConfirmation}
        translate={translate}
        isParentUser={isVPCSignup}
      />
    </div>
  );
};

export default withTranslations(SignupFormContainer, signupTranslationConfig);
