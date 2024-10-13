import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/userTypes';
import AccountSelection from './AccountSelection';
import {
  accountSwitcherStrings,
  isLogoutAllButtonInSwitcherEnabled
} from '../constants/accountSwitcherConstants';
import AddAccountRow from './AddAccountRow';
import { sendShowAccountSwitcherShownEvent } from '../services/eventService';

export type accountSwitcherModalProps = {
  users: TUserData[];
  isAccountLimitReached: boolean;
  onAccountSelection: (userId: number) => void;
  handleAddAccount: () => void;
  handleShowLogoutAllModal: () => void;
  handleModalDismiss: () => void;
  activeUser?: TUserData;
  translate: WithTranslationsProps['translate'];
};

export const AccountSwitcherModal = ({
  users,
  isAccountLimitReached,
  onAccountSelection,
  handleAddAccount,
  handleShowLogoutAllModal,
  handleModalDismiss,
  activeUser,
  translate
}: accountSwitcherModalProps): JSX.Element => {
  const [hasLogged, setHasLogged] = useState<boolean>(false);

  useEffect(() => {
    if (!hasLogged) {
      const userIds = users.map(user => user.id).join(',');
      sendShowAccountSwitcherShownEvent(userIds);
      setHasLogged(true);
    }
  }, [hasLogged, users]);

  return (
    <Fragment>
      <Modal.Header
        className='account-switcher-header'
        title={translate(accountSwitcherStrings.HeadingSwitchAccount)}
        onClose={handleModalDismiss}
      />
      <Modal.Body>
        <div className='section-content modal-section'>
          {isAccountLimitReached && (
            <p className='account-switcher-help-text'>
              {translate(accountSwitcherStrings.DescriptionAccountLimit)}
            </p>
          )}
          <ul className='account-switcher-list '>
            {activeUser && (
              <li className='account-selection-list-item'>
                <AccountSelection
                  key={activeUser.id}
                  userId={activeUser.id}
                  username={activeUser.name}
                  displayName={activeUser.displayName}
                  onAccountSelection={onAccountSelection}
                  translate={translate}
                  showIcon
                />
              </li>
            )}
            {users.map(user => (
              <li className='account-selection-list-item' key={user.id}>
                <AccountSelection
                  key={user.id}
                  userId={user.id}
                  username={user.name}
                  displayName={user.displayName}
                  onAccountSelection={onAccountSelection}
                  translate={translate}
                  showIcon={false}
                />
              </li>
            ))}
            {!isAccountLimitReached && (
              <li className='account-selection-list-item'>
                <AddAccountRow handleAddAccount={handleAddAccount} translate={translate} />
              </li>
            )}
          </ul>
        </div>
      </Modal.Body>
    </Fragment>
  );
};

export default AccountSwitcherModal;
