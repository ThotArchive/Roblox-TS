import React from 'react';
import { EnvironmentUrls } from 'Roblox';

const FriendsCarouselHeader = ({
  friendsCount,
  profileUserId,
  isOwnUser,
  translate
}: {
  friendsCount: number | null;
  profileUserId: number;
  isOwnUser: boolean;
  translate: (key: string) => string;
}): JSX.Element => {
  const friendsCountString = `(${friendsCount ?? 0})`;
  const friendsUrl = isOwnUser
    ? `${EnvironmentUrls.websiteUrl}/users/friends#!/friends`
    : `${EnvironmentUrls.websiteUrl}/users/${profileUserId}/friends#!/friends`;

  return (
    <div className='container-header people-list-header'>
      {friendsCount == null ? (
        <h2>{translate('Heading.Friends')}</h2>
      ) : (
        <h2>
          {translate('Heading.Friends')}
          <span className='friends-count'>{friendsCountString}</span>
        </h2>
      )}
      <a href={friendsUrl} className='btn-secondary-xs btn-more see-all-link-icon'>
        {translate('Heading.SeeAll')}
      </a>
    </div>
  );
};

export default FriendsCarouselHeader;
