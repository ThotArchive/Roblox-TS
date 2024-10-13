import { EnvironmentUrls } from 'Roblox';

export const accountSwitcherStrings = {
  ActionSwitch: 'Action.Switch',
  ActionAdd: 'Action.Add',
  ActionAddAccount: 'Action.AddAccount',
  ActionLogOutAllAccounts: 'Action.LogoutAllAccounts',
  HeadingSwitchAccount: 'Heading.SwitchAccount',
  LabelAddAccountWithoutLoggingOut: 'Label.AddAccountWithoutLoggingOut',
  LabelAddOrSwitchAccount: 'Label.AddOrSwitchAccount',
  DescriptionAccountLimit: 'Description.AccountLimit'
};

export const accountLimitErrorStrings = {
  HeadingAccountLimitReached: 'Heading.AccountLimitReached',
  LabelAccountLimitReached: 'Label.AccountLimitReached',
  ActionOK: 'Action.OK'
};

export const confirmationModalOrigins = {
  LogoutAll: 'logoutAll',
  LoginAccountLimit: 'loginAccountLimit',
  SignupAccountLimit: 'signupAccountLimit',
  UnavailableError: 'unavailableError',
  SwitchError: 'switchError',
  LoginEmptyBlobRequiredError: 'loginEmptyBlobRequiredError',
  SignupEmptyBlobRequiredError: 'signupEmptyBlobRequiredError',
  LoginVpcEmptyBlobRequiredError: 'loginVpcEmptyBlobRequiredError',
  SignupVpcEmptyBlobRequiredError: 'signupVpcEmptyBlobRequiredError'
};

export const errorCasePlaceholderStrings = {
  UnavailableHeaderText: 'Header.AccountSwitchingUnavailable',
  CannotBeSwitchedHelpText: 'Description.InvalidAccountSwitch',
  NotWorkingTryLaterText: 'Description.AccountSwitchingNotWorking'
};

export const commonUiTranslationKeys = {
  ActionOK: 'Action.OK'
};

// TODO swap these out for localized keys
export const logoutAllAccountsPlaceholderStrings = {
  HeaderText: 'Header.LogoutAllAccounts',
  HelpText: 'Description.LogoutAllBody',
  LogoutAllAccountsText: 'Action.ContinueToLogOut',
  StayLoggedInText: '	Action.StayLoggedIn',
  LoginConfirmationHeaderText: 'Header.LogOutOfOtherAccounts',
  LoginConfirmationButtonText: 'Action.Logout',
  LoginConfirmationCancelText: 'Action.Cancel',
  LoginConfirmationHelpText: 'Description.LogoutConfirmation',
  LoginConfirmationHelpTextParent: 'Description.ParentLogoutConfirmation',
  SignupConfirmationHeaderText: 'Header.LogOutOfOtherAccounts',
  SignupConfirmationButtonText: 'Action.Logout',
  SignupConfirmationCancelText: 'Action.Cancel',
  SignupConfirmationHelpText: 'Description.LogoutConfirmation',
  SignupConfirmationHelpTextParent: 'Description.ParentLogoutConfirmation'
};

export const accountSwitchServiceErrorCodes = {
  InvalidSession: 1
};

export const urlConstants = {
  loginLink: `${EnvironmentUrls.websiteUrl}/login`
};

export const accountSwitcherBlobKey = 'RBXASBlob';

export const accountSwitcherBlobSyncedKey = 'RBXASBlobSynced';

// TODO: get this limit from server side data attribute which can be configured.
export const accountSwitcherMaxAccounts = 5;

export const isLogoutAllButtonInSwitcherEnabled = false;

export const modalContainerId = 'navigation-account-switcher-container';

export const accountSwitcherLayerName = 'Accounts.AccountSwitcher';

export enum ModalType {
  AccountSwitcherModalType,
  LogoutAllAccountsModalType,
  LoginConfirmationForLogoutAllAccountsModalType,
  SignupConfirmationForLogoutAllAccountsModalType
}

export default {
  accountSwitcherStrings,
  urlConstants,
  accountSwitcherBlobKey,
  accountSwitcherMaxAccounts,
  confirmationModalOrigins,
  modalContainerId,
  ModalType,
  accountLimitErrorStrings
};
