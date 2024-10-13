import React, { useEffect } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AccountSwitcherService, NavigationService } from 'Roblox';
import {
  accountLimitErrorStrings,
  accountSwitcherStrings,
  confirmationModalOrigins
} from '../../accountSwitcher/constants/accountSwitcherConstants';
import { accountSwitchingTranslationConfig } from '../../reactLogin/translation.config';
import {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob
} from '../../accountSwitcher/utils/accountSwitcherUtils';
import { TBaseConfirmationModalParameters } from '../types/accountSwitcherTypes';
import { logoutAllLoggedInUsers } from '../../accountSwitcher/services/accountSwitcherService';
import {
  ConfirmationModalOrigins,
  sendAuthClientErrorEvent
} from '../../accountSwitcher/services/eventService';
import EVENT_CONSTANTS from '../constants/eventsConstants';
import { sendLogoutAllAccountsOnLoginEvent } from '../../reactLogin/services/eventService';

export type AccountSwitcherRestrictionComponentProps = {
  origin: ConfirmationModalOrigins;
  containerId: string;
  hasMaxLoggedInAccountsSignupError: boolean;
  isAccountLimitReached: boolean;
  handleRedirectHome: () => void;
  translate: WithTranslationsProps['translate'];
  isParentUser: boolean;
};

export const AccountSwitcherRestrictionComponent = ({
  origin,
  containerId,
  hasMaxLoggedInAccountsSignupError,
  isAccountLimitReached,
  handleRedirectHome,
  translate,
  isParentUser
}: AccountSwitcherRestrictionComponentProps): JSX.Element => {
  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  const vpcHandleEmptyAccountSwitchBlobRequired = () => {
    const authClientErrorContext =
      origin === confirmationModalOrigins.LoginEmptyBlobRequiredError
        ? EVENT_CONSTANTS.context.accountSwitcherVpcLogin
        : EVENT_CONSTANTS.context.accountSwitcherVpcSignup;

    const authClientErrorEvent = EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts;

    const ConfirmationModalParameters = {
      containerId,
      origin,
      localizedTitleText: translate('Header.LogoutAllAccounts'),
      localizedBodyText: translate('Description.ParentLogoutConfirmation'),
      localizedPrimaryButtonText: translate('Action.LogoutAllAccounts'),
      primaryButtonCallback: async () => {
        sendLogoutAllAccountsOnLoginEvent();
        const blob = getStoredAccountSwitcherBlob();
        if (blob) {
          try {
            await logoutAllLoggedInUsers({
              encrypted_users_data_blob: blob
            });
          } catch (error) {
            sendAuthClientErrorEvent(authClientErrorContext, authClientErrorEvent);
          }
        }
        deleteAccountSwitcherBlob();
        window.location.reload();
      },
      isModalDismissable: false
    };
    AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
  };

  function getAccountLimitErrorModalParameters(
    shouldShowLogoutAllSecondaryButton: boolean
  ): TBaseConfirmationModalParameters {
    const ConfirmationModalParameters: TBaseConfirmationModalParameters = {
      containerId,
      origin,
      localizedTitleText: translate(accountLimitErrorStrings.HeadingAccountLimitReached),
      localizedBodyText: translate(accountLimitErrorStrings.LabelAccountLimitReached),
      localizedPrimaryButtonText: translate(accountLimitErrorStrings.ActionOK),
      primaryButtonCallback: handleRedirectHome,
      isModalDismissable: false
    };

    if (hasMaxLoggedInAccountsSignupError) {
      ConfirmationModalParameters.localizedSecondaryButtonText = translate(
        accountSwitcherStrings.ActionLogOutAllAccounts
      );
      ConfirmationModalParameters.secondaryButtonCallback = async () => {
        const blob = getStoredAccountSwitcherBlob();
        if (blob) {
          try {
            await logoutAllLoggedInUsers({
              encrypted_users_data_blob: blob
            });
          } catch (error) {
            sendAuthClientErrorEvent(
              EVENT_CONSTANTS.context.accountSwitcherLimitError,
              EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts
            );
          }
        }
        deleteAccountSwitcherBlob();
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          NavigationService?.logoutAndRedirect();
        } catch (error) {
          window.location.reload();
        }
      };
    }
    return ConfirmationModalParameters;
  }

  useEffect(() => {
    if (!isAccountSwitchingEnabledForBrowser) {
      return;
    }
    if (isAccountLimitReached || hasMaxLoggedInAccountsSignupError) {
      const accountLimitConfirmationModalParameters = getAccountLimitErrorModalParameters(
        hasMaxLoggedInAccountsSignupError
      );
      AccountSwitcherService?.renderBaseConfirmationModal(accountLimitConfirmationModalParameters);
    }

    if (isParentUser) {
      vpcHandleEmptyAccountSwitchBlobRequired();
    }
  }, [
    isAccountSwitchingEnabledForBrowser,
    isAccountLimitReached,
    hasMaxLoggedInAccountsSignupError
  ]);

  return <div id={containerId} />;
};

export default withTranslations(
  AccountSwitcherRestrictionComponent,
  accountSwitchingTranslationConfig
);
