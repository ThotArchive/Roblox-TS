import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { AccountSwitcherService, EnvironmentUrls, Endpoints } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { TUserData } from '../../common/types/userTypes';
import { TLoggedInUsers, TSwitchParams } from '../../common/types/accountSwitcherTypes';
import AccountSwitcher from '../components/AccountSwitcher';
import AccountSwitcherModal from '../components/AccountSwitcherModal';
import { accountSwitcherConfig } from '../translation.config';
import { logoutAllLoggedInUsers, switchAccount } from '../services/accountSwitcherService';
import {
  accountSwitcherStrings,
  commonUiTranslationKeys,
  confirmationModalOrigins,
  errorCasePlaceholderStrings,
  logoutAllAccountsPlaceholderStrings,
  modalContainerId,
  ModalType
} from '../constants/accountSwitcherConstants';
import {
  storeAccountSwitcherBlob,
  getStoredAccountSwitcherBlob,
  parseLoggedInUsers,
  deleteAccountSwitcherBlob,
  hasAccountSwitcherInvalidSessionError
} from '../utils/accountSwitcherUtils';
import { AccountSwitcherBaseConfirmationModal } from '../components/AccountSwitcherBaseConfirmationModal';
import {
  sendAuthClientErrorEvent,
  sendAccountSwitchEvent,
  sendDismissAccountSwitcherEvent,
  sendAuthButtonClickEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

export type accountSwitcherContainerProps = {
  modalType?: ModalType;
  titleText?: string;
  helpText?: string;
  onAccountSwitched: (targetUserId: number) => void;
  onConfirmationSuccessCallback?: () => void;
  handleAddAccount: () => void;
  removeInvalidActiveUser?: boolean;
  isModal?: boolean;
  translate: WithTranslationsProps['translate'];
  loggedInUsers?: TLoggedInUsers;
} & WithTranslationsProps;

export const AccountSwitcherContainer = ({
  modalType = ModalType.AccountSwitcherModalType,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  removeInvalidActiveUser = false,
  isModal,
  translate,
  loggedInUsers
}: accountSwitcherContainerProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(!!loggedInUsers);
  const [currentModal, setCurrentModal] = useState(modalType);
  const [users, setUsers] = useState<TLoggedInUsers>({
    activeUser: {} as TUserData,
    usersAvailableForSwitching: [],
    isAccountLimitReached: false
  });

  // Only allow showing as modal if user is authenticated
  const shouldShowAsModal = authenticatedUser.isAuthenticated && isModal;

  function renderSwitchAccountErrorConfirmationModal() {
    const switcherErrorConfirmationModalParameters = {
      containerId: modalContainerId,
      origin: confirmationModalOrigins.UnavailableError,
      localizedTitleText: translate(errorCasePlaceholderStrings.UnavailableHeaderText),
      localizedBodyText: translate(errorCasePlaceholderStrings.CannotBeSwitchedHelpText),
      localizedPrimaryButtonText: translate(commonUiTranslationKeys.ActionOK),
      primaryButtonCallback: () => {
        // positive button takes user to login page
        handleAddAccount();
      }
    };
    AccountSwitcherService.renderBaseConfirmationModal(switcherErrorConfirmationModalParameters);
  }

  const getContextForLogging = () => {
    return shouldShowAsModal
      ? EVENT_CONSTANTS.context.accountSwitcherModal
      : EVENT_CONSTANTS.context.accountSwitcherLogin;
  };

  const handleAccountSelection = async (accountSelectorUserId: number) => {
    const blob = getStoredAccountSwitcherBlob();
    if (blob) {
      const switchParam: TSwitchParams = {
        switched_from_user_id: authenticatedUser.isAuthenticated
          ? authenticatedUser.id.toString()
          : undefined,
        switched_to_user_id: accountSelectorUserId.toString(),
        encrypted_users_data_blob: blob
      };
      try {
        // if the target account is invalid, the call to `switchAccount()` will replace the blob with a new one that does not contain invalid target account
        sendAccountSwitchEvent(getContextForLogging(), accountSelectorUserId.toString());
        const switchResponse = await switchAccount(switchParam);
        storeAccountSwitcherBlob(switchResponse.encrypted_users_data_blob);
        if (switchResponse) {
          if (hasAccountSwitcherInvalidSessionError(switchResponse)) {
            renderSwitchAccountErrorConfirmationModal();
            return;
          }
          onAccountSwitched(accountSelectorUserId);
        }
      } catch {
        renderSwitchAccountErrorConfirmationModal();
      }
    }
  };

  const handleShowLogoutAllModal = () => {
    setCurrentModal(ModalType.LogoutAllAccountsModalType);
  };

  const handleLogoutAllAccounts = async () => {
    const blob = getStoredAccountSwitcherBlob();
    if (blob) {
      try {
        await logoutAllLoggedInUsers({
          encrypted_users_data_blob: blob
        });
      } catch (error) {
        sendAuthClientErrorEvent(
          EVENT_CONSTANTS.context.accountSwitcherModal,
          EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts
        );
      }
      deleteAccountSwitcherBlob();
      window.location.href = Endpoints.getAbsoluteUrl('/');
    }
  };

  const onUsersUpdated = (updatedUsers: TLoggedInUsers) => {
    // TODO: check if active user id is different from authenticated user id
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const updateUsers = async () => {
      if (loggedInUsers) {
        onUsersUpdated(loggedInUsers);
      } else {
        // if loggedInUsers was not set, get it now.
        // TODO: handle errors
        let userResponse: TLoggedInUsers;
        try {
          userResponse = await parseLoggedInUsers(removeInvalidActiveUser);
        } catch {
          const switcherModalPopulationFailureParams = {
            containerId: modalContainerId,
            origin: confirmationModalOrigins.UnavailableError,
            localizedTitleText: translate(errorCasePlaceholderStrings.UnavailableHeaderText),
            localizedBodyText: translate(errorCasePlaceholderStrings.NotWorkingTryLaterText),
            localizedPrimaryButtonText: translate(commonUiTranslationKeys.ActionOK),
            primaryButtonCallback: () => {
              // no op
            }
          };
          AccountSwitcherService.renderBaseConfirmationModal(switcherModalPopulationFailureParams);
          return;
        }
        const {
          activeUser,
          usersAvailableForSwitching,
          isAccountLimitReached,
          loggedOutUser
        } = userResponse;

        // TODO: check if active user id is different from authenticated user id
        onUsersUpdated({
          activeUser,
          usersAvailableForSwitching,
          isAccountLimitReached,
          loggedOutUser
        });
      }

      setIsModalOpen(true);
    };
    // TODO: handle errors
    // eslint-disable-next-line no-void
    void updateUsers().catch();
  }, [loggedInUsers, removeInvalidActiveUser]);

  const handleModalDismiss = () => {
    setIsModalOpen(false);
    sendDismissAccountSwitcherEvent();
  };

  function handleAddAccountAndSendClickLog() {
    sendAuthButtonClickEvent(getContextForLogging(), EVENT_CONSTANTS.btn.addAccount);
    handleAddAccount();
  }

  if (shouldShowAsModal) {
    return (
      <Modal
        className='account-switcher-modal'
        show={isModalOpen}
        onHide={handleModalDismiss}
        size='sm'>
        {currentModal === ModalType.AccountSwitcherModalType && (
          <AccountSwitcherModal
            users={users.usersAvailableForSwitching}
            isAccountLimitReached={users.isAccountLimitReached}
            onAccountSelection={handleAccountSelection}
            handleAddAccount={handleAddAccountAndSendClickLog}
            handleShowLogoutAllModal={handleShowLogoutAllModal}
            handleModalDismiss={handleModalDismiss}
            activeUser={users.activeUser}
            translate={translate}
          />
        )}
        {currentModal === ModalType.LogoutAllAccountsModalType && (
          <AccountSwitcherBaseConfirmationModal
            origin={confirmationModalOrigins.LogoutAll}
            localizedTitleText={translate(accountSwitcherStrings.ActionLogOutAllAccounts)} // TODO switch to Header.LogoutAllAccounts when translations ready
            localizedBodyText={logoutAllAccountsPlaceholderStrings.HelpText}
            primaryButtonCallback={handleLogoutAllAccounts}
            localizedPrimaryButtonText={logoutAllAccountsPlaceholderStrings.LogoutAllAccountsText}
            secondaryButtonCallback={handleModalDismiss}
            localizedSecondaryButtonText={logoutAllAccountsPlaceholderStrings.StayLoggedInText}
            onClose={handleModalDismiss}
          />
        )}
      </Modal>
    );
  }

  return (
    <div className='account-switcher-container'>
      {users.usersAvailableForSwitching?.length > 0 && (
        <AccountSwitcher
          users={users.usersAvailableForSwitching}
          titleText={titleText}
          helpText={helpText}
          onAccountSelection={handleAccountSelection}
          handleAddAccount={handleAddAccountAndSendClickLog}
          translate={translate}
        />
      )}
    </div>
  );
};

export default withTranslations(AccountSwitcherContainer, accountSwitcherConfig);
