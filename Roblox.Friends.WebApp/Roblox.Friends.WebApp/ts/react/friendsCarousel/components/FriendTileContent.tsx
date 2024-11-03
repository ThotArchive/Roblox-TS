import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import AvatarHeadshot from './AvatarHeadshot';

const FriendTileContent = ({
  id,
  displayName,
  userProfileUrl,
  userPresence,
  hasVerifiedBadge,
  translate
}: {
  id: number;
  displayName: string;
  userProfileUrl: string;
  userPresence: string | null | undefined;
  hasVerifiedBadge: boolean;
  translate: TranslateFunction;
}): JSX.Element => {
  return (
    <div className='friend-tile-content'>
      <AvatarHeadshot id={id} translate={translate} userProfileUrl={userProfileUrl} />
      <a href={userProfileUrl} className='friends-carousel-tile-labels'>
        <div className='friends-carousel-tile-label'>
          <div className='friends-carousel-tile-name'>
            <span className='friends-carousel-display-name'>{displayName}</span>
            {hasVerifiedBadge && (
              <div className='friend-tile-verified-badge'>
                <div className='friend-tile-spacer' />
                <VerifiedBadgeIconContainer
                  size={BadgeSizes.SUBHEADER}
                  additionalContainerClass='verified-badge'
                />
              </div>
            )}
          </div>
        </div>
        <div className='friends-carousel-tile-sublabel'>
          {userPresence != null && (
            <div className='friends-carousel-tile-experience'>{userPresence}</div>
          )}
        </div>
      </a>
    </div>
  );
};
export default FriendTileContent;
