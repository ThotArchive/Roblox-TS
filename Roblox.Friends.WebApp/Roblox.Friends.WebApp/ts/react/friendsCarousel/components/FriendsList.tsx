import React, { useEffect, useRef, useState } from 'react';
import { EventContext } from '@rbx/unified-logging';
import FriendTile from './FriendTile';
import { TFriend } from '../types/friendsCarouselTypes';
import useFriendsCarouselImpressionTracker from '../hooks/useFriendsCarouselImpressionTracker';
import FriendCarouselNames from '../constants/friendCarouselNames';
import AddFriendsTile from './AddFriendsTile';

const FRIEND_TILE_WIDTH = 110;

const FriendsList = ({
  friendsList,
  isOwnUser,
  translate,
  canChat,
  carouselName,
  eventContext,
  homePageSessionInfo,
  sortId,
  sortPosition,
  badgeCount,
  isAddFriendsTileEnabled
}: {
  friendsList: TFriend[] | null;
  isOwnUser: boolean;
  translate: (key: string) => string;
  canChat: boolean;
  carouselName: FriendCarouselNames;
  eventContext: EventContext;
  homePageSessionInfo: string | undefined;
  sortId: number | undefined;
  sortPosition: number | undefined;
  badgeCount: number;
  isAddFriendsTileEnabled: boolean;
}): JSX.Element => {
  const parentRef = useRef<HTMLElement | null>(null);
  const [visibleFriendsList, setVisibleFriendsList] = useState(friendsList);

  const [listIsFull, setListIsFull] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const totalWidth = parentRef.current?.offsetWidth;
    setListIsFull(FRIEND_TILE_WIDTH * (friendsList?.length ?? 0) > (totalWidth ?? 0));
    if (totalWidth != null && friendsList != null) {
      const visibleTileCount = Math.floor(totalWidth / FRIEND_TILE_WIDTH);
      setVisibleFriendsList(friendsList.slice(0, visibleTileCount));
    }
  }, [parentRef.current?.offsetWidth, friendsList]);

  useFriendsCarouselImpressionTracker(
    containerRef,
    // https://roblox.atlassian.net/browse/CLIGROW-2178
    // Send friendsList instead of visibleFriendsList to workaround
    // race condition where visibleFriendsList is not updated yet
    friendsList,
    carouselName,
    eventContext,
    homePageSessionInfo,
    sortId,
    sortPosition
  );

  return (
    <div>
      <div
        ref={el => {
          parentRef.current = el;
          return parentRef.current;
        }}
        className='friends-carousel-container'>
        {visibleFriendsList == null ? (
          <span className='spinner spinner-default' />
        ) : (
          <div
            ref={containerRef}
            className={
              listIsFull
                ? 'friends-carousel-list-container'
                : 'friends-carousel-list-container-not-full'
            }>
            {carouselName === FriendCarouselNames.WebHomeFriendsCarousel &&
            isAddFriendsTileEnabled ? (
              <AddFriendsTile
                key='add-friends-tile'
                translate={translate}
                badgeCount={badgeCount}
                data-testid='add-friends-tile'
              />
            ) : null}
            {visibleFriendsList.map((item, index) => {
              return (
                <div key={item.id}>
                  <FriendTile
                    friend={item}
                    friendIndex={index}
                    translate={translate}
                    isOwnUser={isOwnUser}
                    canChat={canChat}
                    carouselName={carouselName}
                    eventContext={eventContext}
                    homePageSessionInfo={homePageSessionInfo}
                    sortId={sortId}
                    sortPosition={sortPosition}
                    totalNumberOfFriends={friendsList?.length ?? 0}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
