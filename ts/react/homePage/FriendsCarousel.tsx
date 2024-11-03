import React from 'react';
import { CurrentUser } from 'Roblox';
import FriendsCarouselContainer from '../../../../../Roblox.Friends.WebApp/Roblox.Friends.WebApp/ts/react/friendsCarousel/containers/FriendsCarouselContainer';

import '../../../../../Roblox.Friends.WebApp/Roblox.Friends.WebApp/css/friendsCarousel/friendsCarousel.scss';

const FriendsCarousel = (): JSX.Element => {
  const userDataMetaTag = document.querySelector('meta[name="user-data"]');
  const profileUserId: number = (userDataMetaTag
    ? userDataMetaTag.getAttribute('data-userid')
    : Number(CurrentUser.userId ?? '0')) as number;

  return (
    <div className='friend-carousel-container'>
      <FriendsCarouselContainer profileUserId={profileUserId} isOwnUser />
    </div>
  );
};

export default FriendsCarousel;
