import { WithTranslationsProps } from 'react-utilities';
import { AccountSwitcherService } from 'Roblox';
import { dataStores } from 'core-roblox-utilities';
import { TValidateUsernameParams, TValidateUsernameResponse } from '../../common/types/signupTypes';
import {
  usernameValidationMessageMap,
  localeParamName,
  urlQueryNames,
  counters,
  newUserParam,
  urlConstants,
  minSignUpAge,
  validationMessages,
  validateUsernameContext,
  accountSwitcherConfirmationModalContainer
} from '../constants/signupConstants';
import { validateUsername } from '../services/signupService';
import { qualifiedSignup } from '../services/affiliateLinksService';
import getInvalidUsernameMessage from '../../common/utils/usernameValidationUtils';
import getInvalidPasswordMessage from '../../common/utils/passwordValidationUtils';
import { parseErrorCode } from '../../common/utils/requestUtils';
import { getUrlParamValue, navigateToPage } from '../../common/utils/browserUtils';
import { cleanupIdentityVerificationResultToken } from './identityVerificationUtils';
import {
  incrementEphemeralCounter,
  sendConversionEvent,
  sendLogoutAllAccountsOnSignupEvent
} from '../services/eventService';
import { landingPageContainer } from '../../common/constants/browserConstants';
import {
  confirmationModalOrigins,
  logoutAllAccountsPlaceholderStrings
} from '../../accountSwitcher/constants/accountSwitcherConstants';
import {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob
} from '../../accountSwitcher/utils/accountSwitcherUtils';
import { logoutAllLoggedInUsers } from '../../accountSwitcher/services/accountSwitcherService';
import { sendAuthClientErrorEvent } from '../../accountSwitcher/services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { getExperienceAffiliateReferralUrl, getLinkCode } from './affiliateLinksUtils';

const getErrorCodeFromValidateUsernameResponse = (response: TValidateUsernameResponse): string => {
  let validationMessage = '';
  if (usernameValidationMessageMap.has(response.code)) {
    validationMessage = usernameValidationMessageMap.get(response.code)!;
  }
  return validationMessage;
};

export const getUsernameValidationMessage = async (
  username?: string,
  birthdayDay?: string,
  birthdayMonth?: string,
  birthdayYear?: string
): Promise<string> => {
  let localValidationMessage = '';
  let hasLocalValidationFailure = false;

  if (username === undefined || username === '') {
    hasLocalValidationFailure = true;
    localValidationMessage = validationMessages.usernameRequired;
  } else {
    localValidationMessage = getInvalidUsernameMessage(username);
    if (localValidationMessage !== '') {
      hasLocalValidationFailure = true;
    }
  }

  if (!birthdayDay || !birthdayMonth || !birthdayYear) {
    hasLocalValidationFailure = true;
    localValidationMessage = validationMessages.birthdayRequired;
  }

  if (hasLocalValidationFailure) {
    return localValidationMessage;
  }

  const validateUsernameParams: TValidateUsernameParams = {
    username: username!,
    context: validateUsernameContext
  };

  const birthday = new Date(Date.parse(`${birthdayMonth!} ${birthdayDay!}, ${birthdayYear!}`));

  if (!Number.isNaN(birthday.getMilliseconds())) {
    validateUsernameParams.birthday = birthday;
  }

  try {
    const validateUsernameResponse = await validateUsername(validateUsernameParams);
    return getErrorCodeFromValidateUsernameResponse(validateUsernameResponse);
  } catch (error) {
    const errorCode = parseErrorCode(error);
    if (errorCode === 2) {
      return validationMessages.birthdayRequired;
    }
  }
  return '';
};

export const getPasswordValidationMessage = async (
  username?: string,
  password?: string,
  passwordThatFailedServerCheck?: string,
  country?: string
): Promise<string | null> => {
  let invalidPasswordMessage = '';
  if (password === undefined) {
    return null;
  }
  invalidPasswordMessage = await getInvalidPasswordMessage(password, username, country);
  if (invalidPasswordMessage !== '') {
    return invalidPasswordMessage;
  }
  if (password === passwordThatFailedServerCheck) {
    return validationMessages.useDifferentPassword;
  }
  return '';
};

export const getLocale = (): string | null => {
  return getUrlParamValue(urlQueryNames.locale);
};

export const buildLinkWithLocale = (url: string, locale: string): string => {
  if (locale) {
    return url + localeParamName + locale;
  }

  return url;
};

export const isValidBirthday = (year: string, month: string, day: string): boolean => {
  if (!year || !month || !day) {
    return false;
  }

  // Make sure we can create a valid date object
  const testDate = new Date(`${month} ${day} ${year}`);
  if (Number.isNaN(testDate.getTime())) {
    return false;
  }

  // checks that it is actually a valid day in that month (like feb 31 doesn't exist but would generate a valid Date)
  if (testDate.getDate() !== parseInt(day, 10)) {
    return false;
  }

  // age limits
  const today = new Date();
  const minimumBirthdate = new Date(
    today.getFullYear() - minSignUpAge,
    today.getMonth(),
    today.getDate()
  );
  const isBirthdayValid =
    testDate.getTime() <= minimumBirthdate.getTime() &&
    testDate.getFullYear() > today.getFullYear() - 100;
  if (!isBirthdayValid) {
    return false;
  }

  return true;
};

export const handlePostSignup = async (returnUrlValue?: string, userId?: string): Promise<void> => {
  cleanupIdentityVerificationResultToken();
  incrementEphemeralCounter(counters.success);
  let returnUrl = returnUrlValue;
  try {
    if (userId) {
      const {
        authIntentDataStore: { applyUserAuthIntent, hasUnclaimedAuthIntent }
      } = dataStores;
      if (hasUnclaimedAuthIntent()) {
        incrementEphemeralCounter(counters.successWithGameIntent);
      }
      applyUserAuthIntent(userId);
    }
  } catch (e) {
    console.error('Error applying auth intent data:', e);
  }

  if (typeof returnUrl === 'string' && returnUrl.length > 0) {
    const affiliateLink = getExperienceAffiliateReferralUrl(returnUrl);
    if (affiliateLink) {
      const linkCode = getLinkCode(affiliateLink);
      await qualifiedSignup({ referralUrl: affiliateLink ?? '', linkId: linkCode });
    }

    if (returnUrl.indexOf('?') === -1) {
      returnUrl += '?';
    } else {
      returnUrl += '&';
    }
    returnUrl += newUserParam;

    sendConversionEvent(() => navigateToPage(returnUrl!));
  } else {
    sendConversionEvent(() => navigateToPage(urlConstants.homePageNewUser));
  }
};

export const handleEmptyAccountSwitchBlobRequired = (
  confirmationCallback: () => void,
  translate: WithTranslationsProps['translate'],
  isParentError: boolean
): void => {
  const confirmationOrigin = isParentError
    ? confirmationModalOrigins.SignupVpcEmptyBlobRequiredError
    : confirmationModalOrigins.SignupEmptyBlobRequiredError;

  const untranslatedBodyText = isParentError
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpTextParent
    : logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpText;

  const authClientErrorContext = isParentError
    ? EVENT_CONSTANTS.context.accountSwitcherVpcSignup
    : EVENT_CONSTANTS.context.accountSwitcherSignup;

  const authClientErrorType = EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts;

  const ConfirmationModalParameters = {
    containerId: accountSwitcherConfirmationModalContainer,
    origin: confirmationOrigin,
    localizedTitleText: translate(logoutAllAccountsPlaceholderStrings.SignupConfirmationHeaderText),
    localizedBodyText: translate(untranslatedBodyText),
    localizedPrimaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.SignupConfirmationButtonText
    ),
    localizedSecondaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.SignupConfirmationCancelText
    ),
    primaryButtonCallback: async () => {
      sendLogoutAllAccountsOnSignupEvent();
      const blob = getStoredAccountSwitcherBlob();
      if (blob) {
        try {
          await logoutAllLoggedInUsers({
            encrypted_users_data_blob: blob
          });
        } catch (error) {
          sendAuthClientErrorEvent(authClientErrorContext, authClientErrorType);
        }
      }
      deleteAccountSwitcherBlob();
      confirmationCallback();
    },
    secondaryButtonCallback: () => {
      // no op for cancel button
    }
  };
  AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
};

export const getReturnUrl = (): string => {
  const entryPoint = landingPageContainer();
  const returnUrl = entryPoint?.getAttribute('data-return-url') || '';
  return returnUrl;
};

export const getDataToken = (): string => {
  const entryPoint = landingPageContainer();
  const dataToken = entryPoint?.getAttribute('data-token') || '';
  return dataToken;
};

export const isVerifiedParentConsentSignup = (): boolean => {
  const dataToken = getDataToken();
  return !!dataToken;
};

export const isVerifiedParentalConsentDecompSignup = (): boolean => {
  const source = getUrlParamValue('source');
  return source === 'VerifiedParentalConsent';
};

export const getBirthdayToPrefill = (): string => {
  const entryPoint = landingPageContainer();
  const prefillBirthday = entryPoint?.getAttribute('data-prefill-birthday') || '';
  return prefillBirthday;
};

export const getActiveUserBirthdayToPrefill = (): string => {
  const entryPoint = landingPageContainer();
  const activeUserBirthday = entryPoint?.getAttribute('data-active-user-birthday') || '';
  return activeUserBirthday;
};

export const getIsSignupButtonDisabled = (isFormValid: boolean, isSubmitting: boolean): boolean => {
  return !isFormValid || isSubmitting;
};

export default {
  getLocale,
  buildLinkWithLocale,
  isValidBirthday,
  handlePostSignup,
  getUsernameValidationMessage,
  getPasswordValidationMessage,
  getReturnUrl,
  getBirthdayToPrefill,
  getActiveUserBirthdayToPrefill
};

export const getIsKoreaSignupPoliciesAgreementButtonDisabled = (
  isPoliciesAgreementCheckBoxesChecked: boolean,
  isSubmitting: boolean
): boolean => {
  return !isPoliciesAgreementCheckBoxesChecked || isSubmitting;
};
