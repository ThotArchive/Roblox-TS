import React from 'react';
import { EventContext } from '@rbx/unified-logging';
import { CurrentUser } from 'Roblox';
import FriendsCarouselContainer from '../../../../../Roblox.Friends.WebApp/Roblox.Friends.WebApp/ts/react/friendsCarousel/containers/FriendsCarouselContainer';
import FriendCarouselNames from '../../../../../Roblox.Friends.WebApp/Roblox.Friends.WebApp/ts/react/friendsCarousel/constants/friendCarouselNames';

import '../../../../../Roblox.Friends.WebApp/Roblox.Friends.WebApp/css/friendsCarousel/friendsCarousel.scss';

type TFriendsCarouselProps = {
  homePageSessionInfo: string;
  sortId: number | undefined;
  sortPosition: number;
};

const FriendsCarousel = ({
  homePageSessionInfo,
  sortId,
  sortPosition
}: TFriendsCarouselProps): JSX.Element => {
  const userDataMetaTag = document.querySelector('meta[name="user-data"]');
  const profileUserId: number = (userDataMetaTag
    ? userDataMetaTag.getAttribute('data-userid')
    : Number(CurrentUser.userId ?? '0')) as number;

  return (
    <div className='friend-carousel-container'>
      <FriendsCarouselContainer
        profileUserId={profileUserId}
        isOwnUser
        carouselName={FriendCarouselNames.WebHomeFriendsCarousel}
        eventContext={EventContext.Home}
        homePageSessionInfo={homePageSessionInfo}
        sortId={sortId}
        sortPosition={sortPosition}
      />
    </div>
  );
};

export default FriendsCarousel;
