import React, { useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { accountSwitcherConfig } from '../translation.config';
import { accountSwitcherStrings } from '../constants/accountSwitcherConstants';

export type accountSelectionProps = {
  handleAddAccount: () => void;
  translate: WithTranslationsProps['translate'];
};

export const AccountSelection = ({
  handleAddAccount,
  translate
}: accountSelectionProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  return (
    <div
      className='account-selection'
      role='button'
      tabIndex={0}
      onClick={() => {
        setIsSubmitting(true);
        handleAddAccount();
      }}
      onKeyDown={() => {
        setIsSubmitting(true);
        handleAddAccount();
      }}>
      <div className='account-switcher-icon-add'>
        <span className='icon-plus' />
      </div>
      <div className='account-selection-name-container'>
        <p className='account-selection-add-account'>
          {translate(accountSwitcherStrings.ActionAddAccount)}
        </p>
      </div>
      {isSubmitting && <div className='spinner spinner-sm spinner-block' />}
    </div>
  );
};

export default withTranslations(AccountSelection, accountSwitcherConfig);
