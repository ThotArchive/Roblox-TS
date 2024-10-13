/* eslint-disable no-void */
import angular from 'angular';
import { EmailVerificationService, AccountSwitcherService, ExperimentationService } from 'Roblox';
import { urlService } from 'core-utilities';
import { authenticatedUser } from 'header-scripts';
import { localStorageService } from 'core-roblox-utilities';
import navigationService from '../services/navigationService';
import { getIntAuthCompliancePolicy } from '../services/complianceService';
import layoutConstants from '../constants/layoutConstants';
import urlConstants from '../constants/urlConstants';
import {
  sendLogoutButtonClickEvent,
  sendSwitchAccountButtonClickEvent
} from '../services/eventService';

const { getQueryParam, composeQueryString } = urlService;
const {
  getSignupRedirUrl,
  getLoginUrl,
  getNewLoginUrl,
  getHomeUrl,
  getAccountSwitchingSignUpUrl
} = urlConstants;

const { logoutEvent } = layoutConstants;
const VNG_LANDING_LAYER = 'Website.LandingPage';
const getReturnUrl = () => {
  // return from the current page if there is no returnUrl param, except it is from login page or the signup page.
  let returnUrl = getQueryParam('returnUrl') || window.location.href;
  returnUrl =
    returnUrl === getLoginUrl() || returnUrl === getAccountSwitchingSignUpUrl() ? '' : returnUrl;
  return returnUrl;
};

const getSignupUrl = (isAccountSwitcherAvailableForBrowser = false) => {
  let returnUrl;
  let signupUrl;
  if (authenticatedUser.isAuthenticated && isAccountSwitcherAvailableForBrowser) {
    returnUrl = getReturnUrl();
    signupUrl = getAccountSwitchingSignUpUrl();
  } else {
    returnUrl = getQueryParam('returnUrl') || window.location.href;

    // Do not add return url if the url points to login page in any way
    const lowerCaseReturnUrl = returnUrl.toLowerCase();
    const doesReturnUrlStartWithLoginUrl =
      lowerCaseReturnUrl.startsWith(getLoginUrl().toLowerCase()) ||
      lowerCaseReturnUrl.startsWith(getNewLoginUrl().toLowerCase());
    returnUrl = doesReturnUrlStartWithLoginUrl ? '' : returnUrl;
    signupUrl = getSignupRedirUrl();
  }
  return `${signupUrl}?${composeQueryString({ returnUrl })}`;
};

const getLoginLinkUrl = () => {
  let returnUrl;
  if (AccountSwitcherService?.isAccountSwitcherAvailable()) {
    returnUrl = getReturnUrl();
  } else {
    // return from the current page if there is no returnUrl param
    returnUrl = getQueryParam('returnUrl') || window.location.href;
  }
  const loginUrl = getLoginUrl();
  return `${loginUrl}?${composeQueryString({ returnUrl })}`;
};

const logoutAndRedirect = () => {
  return navigationService.logout().then(async () => {
    // NOTE: we should not delete keyPairs upon logout.
    // TODO: delete CrpytoKey in indexeddb when all users are signed out.
    window.location.reload();
  });
};

const navigateToLoginWithRedirect = () => {
  window.location.href = getLoginLinkUrl();
};

const logoutUser = e => {
  e.stopPropagation();
  e.preventDefault();
  document.dispatchEvent(new CustomEvent(logoutEvent.name));
  sendLogoutButtonClickEvent();

  if (!angular.isUndefined(angular.element('#chat-container').scope())) {
    const scope = angular.element('#chat-container').scope();
    scope.$digest(scope.$broadcast('Roblox.Chat.destroyChatCookie'));
  }
  EmailVerificationService?.handleUserEmailUpsellAtLogout(logoutAndRedirect).then(data => {
    // if user is not in test group or has email on file already, logout directly
    if (!data || data.emailAddress) {
      logoutAndRedirect();
    }
  });
};

// Account Switching
const switchAccount = e => {
  e.stopPropagation();
  e.preventDefault();
  sendSwitchAccountButtonClickEvent(window.location.href);

  // destroy chat cookie after account switching
  if (!angular.isUndefined(angular.element('#chat-container').scope())) {
    const scope = angular.element('#chat-container').scope();
    scope.$digest(scope.$broadcast('Roblox.Chat.destroyChatCookie'));
  }

  const containerId = 'navigation-account-switcher-container';

  const switchAccountAndGoToHomePage = () => {
    localStorageService.setLocalStorage(
      layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
      true
    );
    window.location.href = getHomeUrl();
  };

  const addAccountAndReturnOnSuccess = () => {
    window.location.href = urlConstants.getLoginUrl();
  };

  const AccountSwitcherParameters = {
    containerId,
    onAccountSwitched: switchAccountAndGoToHomePage,
    handleAddAccount: addAccountAndReturnOnSuccess
  };
  // fire and forget renderAccountSwitcher
  const tryOpenAccountSwitcherModal = async () => {
    if (await AccountSwitcherService?.isAccountSwitcherAvailable()) {
      void AccountSwitcherService?.renderAccountSwitcher(AccountSwitcherParameters);
    }
  };
  tryOpenAccountSwitcherModal();
};

const isLoginLinkAvailable = () => {
  const { pathname } = window?.location;
  const currentPath = pathname?.toLowerCase() ?? '';

  return !currentPath.startsWith('/login') && !currentPath.startsWith('/newlogin');
};

const getIsVNGLandingRedirectEnabled = async () => {
  try {
    const data = await ExperimentationService.getAllValuesForLayer(VNG_LANDING_LAYER);
    const isIXPEnabled = data?.IsVngLandingPageRedirectEnabled ?? false;
    const { isVNGComplianceEnabled: isFeatureEnabled } = await getIntAuthCompliancePolicy();
    return isFeatureEnabled && isIXPEnabled;
  } catch (e) {
    // fall back to false
    return false;
  }
};

export default {
  getSignupUrl,
  getLoginLinkUrl,
  logoutUser,
  logoutAndRedirect,
  isLoginLinkAvailable,
  switchAccount,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect
};
