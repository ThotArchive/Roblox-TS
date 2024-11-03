import React, { useEffect, useRef, useState } from 'react';
import FriendTile from './FriendTile';
import { TFriend } from '../types/friendsCarouselTypes';

const FRIEND_TILE_WIDTH = 110;

const FriendsList = ({
  friendsList,
  isOwnUser,
  translate,
  canChat
}: {
  friendsList: TFriend[] | null;
  isOwnUser: boolean;
  translate: (key: string) => string;
  canChat: boolean;
}): JSX.Element => {
  const parentRef = useRef<HTMLElement | null>(null);
  const [visibleFriendsList, setVisibleFriendsList] = useState(friendsList);
  const [listIsFull, setListIsFull] = useState(false);

  useEffect(() => {
    const totalWidth = parentRef.current?.offsetWidth;
    setListIsFull(FRIEND_TILE_WIDTH * (friendsList?.length ?? 0) > (totalWidth ?? 0));
    if (totalWidth != null && friendsList != null) {
      const visibleTileCount = Math.floor(totalWidth / FRIEND_TILE_WIDTH);
      setVisibleFriendsList(friendsList.slice(0, visibleTileCount));
    }
  }, [parentRef.current?.offsetWidth, friendsList]);

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
            className={
              listIsFull
                ? 'friends-carousel-list-container'
                : 'friends-carousel-list-container-not-full'
            }>
            {visibleFriendsList.map(item => {
              return (
                <div key={item.id}>
                  <FriendTile
                    friend={item}
                    translate={translate}
                    isOwnUser={isOwnUser}
                    canChat={canChat}
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
