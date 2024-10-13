import React, { useState } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/userTypes';
import AccountSelection from './AccountSelection';
import AddAccountRow from './AddAccountRow';

export type accountSwitcherProps = {
  users: TUserData[];
  titleText?: string;
  helpText?: string;
  onAccountSelection: (userId: number) => void;
  handleAddAccount: () => void;
  translate: WithTranslationsProps['translate'];
};

export const AccountSwitcher = ({
  users,
  titleText,
  helpText,
  onAccountSelection,
  handleAddAccount,
  translate
}: accountSwitcherProps): JSX.Element => {
  const [hasAnyRowBeenClicked, setHasAnyRowBeenClicked] = useState<boolean>(false);

  const handleAccountSwitch = (userId: number) => {
    if (!hasAnyRowBeenClicked) {
      setHasAnyRowBeenClicked(true);
      try {
        onAccountSelection(userId);
      } catch (e) {
        setHasAnyRowBeenClicked(false);
      }
    }
  };

  return (
    <div className='section-content account-switcher-section'>
      <h1 className='account-switcher-header'>{titleText}</h1>
      <h1 className='account-switcher-help-text'>{helpText}</h1>
      <ul className='account-switcher-list '>
        {users.map(user => (
          // iterator elements should have a unique key
          <li key={user.id}>
            <div className='account-selection-list-item' role='button' tabIndex={0}>
              <AccountSelection
                userId={user.id}
                username={user.name}
                displayName={user.displayName}
                onAccountSelection={handleAccountSwitch}
                showIcon={false}
                translate={translate}
              />
            </div>
          </li>
        ))}
        <li className='account-selection-list-item'>
          <AddAccountRow handleAddAccount={handleAddAccount} translate={translate} />
        </li>
      </ul>
    </div>
  );
};

export default AccountSwitcher;
