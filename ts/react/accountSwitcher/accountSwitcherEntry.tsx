import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import AccountSwitcherContainer from './containers/AccountSwitcherContainer';
import {
  TRenderAccountSwitcher,
  TRenderBaseConfirmationModal
} from '../common/types/accountSwitcherTypes';
import { AccountSwitcherService } from './interface';
import useIsAccountSwitcherAvailableForBrowser from './hooks/useIsAccountSwitcherAvailableForBrowser';
import {
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  isAccountSwitchingEnabled,
  isAccountSwitcherAvailable,
  syncAccountSwitcherBlobIfNeeded
} from './utils/accountSwitcherUtils';
import '../../../css/accountSwitcher/accountSwitcher.scss';
import ConfirmationModalContainer from './containers/ConfirmationModalContainer';

export const renderAccountSwitcher: TRenderAccountSwitcher = async ({
  containerId,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  removeInvalidActiveUser,
  isModal = true,
  translate,
  loggedInUsers
}): Promise<boolean> => {
  const container = document.getElementById(containerId);

  if ((await isAccountSwitcherAvailable()) && container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    render(
      <AccountSwitcherContainer
        titleText={titleText}
        helpText={helpText}
        onAccountSwitched={onAccountSwitched}
        handleAddAccount={handleAddAccount}
        removeInvalidActiveUser={removeInvalidActiveUser}
        isModal={isModal}
        translate={translate}
        loggedInUsers={loggedInUsers}
      />,
      container
    );
    return true;
  }
  return false;
};

export const renderBaseConfirmationModal: TRenderBaseConfirmationModal = ({
  containerId,
  origin,
  localizedTitleText,
  localizedBodyText,
  primaryButtonCallback,
  localizedPrimaryButtonText,
  secondaryButtonCallback,
  localizedSecondaryButtonText,
  isModalDismissable = true
}): boolean => {
  const container = document.getElementById(containerId);

  if (isAccountSwitchingEnabled() && container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    render(
      <ConfirmationModalContainer
        origin={origin}
        localizedTitleText={localizedTitleText}
        localizedBodyText={localizedBodyText}
        primaryButtonCallback={primaryButtonCallback}
        localizedPrimaryButtonText={localizedPrimaryButtonText}
        secondaryButtonCallback={secondaryButtonCallback}
        localizedSecondaryButtonText={localizedSecondaryButtonText}
        isModalDismissable={isModalDismissable}
      />,
      container
    );
    return true;
  }
  return false;
};

const AccountSwitcherService = {
  isAccountSwitcherAvailable,
  renderAccountSwitcher,
  renderBaseConfirmationModal,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  useIsAccountSwitcherAvailableForBrowser,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded
};

Object.assign(Roblox, {
  AccountSwitcherService
});

export default {
  renderAccountSwitcher,
  renderBaseConfirmationModal,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded
};
