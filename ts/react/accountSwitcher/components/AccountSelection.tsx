import React, { useState } from 'react';
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from 'roblox-thumbnails';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { urlQueryConstants } from '../../common/constants/urlConstants';
import { accountSwitcherConfig } from '../translation.config';

export type accountSelectionProps = {
  userId: number;
  displayName?: string;
  username?: string;
  onAccountSelection: (userId: number) => void;
  showIcon: boolean;
  translate: WithTranslationsProps['translate'];
};

export const AccountSelection = ({
  userId,
  displayName,
  username,
  onAccountSelection,
  showIcon,
  translate
}: accountSelectionProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAccountSelection = () => {
    if (!showIcon && !isSubmitting) {
      setIsSubmitting(true);
      try {
        onAccountSelection(userId);
      } catch (e) {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <div
      className={showIcon ? 'active-account' : 'account-selection'}
      role='button'
      tabIndex={0}
      onClick={handleAccountSelection}
      onKeyDown={handleAccountSelection}>
      <div className='account-selection-thumbnail'>
        <Thumbnail2d
          containerClass='avatar-card-image'
          type={ThumbnailTypes.avatarHeadshot}
          targetId={userId}
          size={ThumbnailAvatarHeadshotSize.size60}
        />
      </div>
      <div className='account-selection-name-container'>
        <p className='account-selection-displayname'>{displayName || username}</p>
        <p className='account-selection-username'>
          {username ? urlQueryConstants.atSign + username : ''}
        </p>
      </div>

      {showIcon && <div className='accept-icon-image' />}
      {isSubmitting && <div className='spinner spinner-sm spinner-no-margin spinner-block' />}
    </div>
  );
};

export default withTranslations(AccountSelection, accountSwitcherConfig);
