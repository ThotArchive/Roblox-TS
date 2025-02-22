import React from 'react';
import FriendsCarousel from '../homePage/FriendsCarousel';
import { usePageSession } from '../common/utils/PageSessionContext';

type TFriendCarouselFeedItemProps = {
  sortId: number;
  sortPosition: number;
};

const FriendCarouselFeedItem = ({
  sortId,
  sortPosition
}: TFriendCarouselFeedItemProps): JSX.Element => {
  const homePageSessionInfo = usePageSession();

  return (
    <FriendsCarousel
      homePageSessionInfo={homePageSessionInfo}
      sortId={sortId}
      sortPosition={sortPosition}
    />
  );
};

export default FriendCarouselFeedItem;
