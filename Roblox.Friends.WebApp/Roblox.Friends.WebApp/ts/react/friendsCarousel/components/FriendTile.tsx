import React, { useEffect } from 'react';
import { EnvironmentUrls } from 'Roblox';
import { TranslateFunction } from 'react-utilities';
import Presence from 'roblox-presence';
import { TFriend } from '../types/friendsCarouselTypes';
import FriendTileContent from './FriendTileContent';
import FriendTileDropDown from './FriendTileDropdown';
import FriendTilePopover from './FriendTilePopover';

const DROPDOWN_WIDTH = 240;
const DROPDOWN_WIDTH_INGAME = 315;

const FriendTile = ({
  friend,
  isOwnUser,
  translate,
  canChat
}: {
  friend: TFriend;
  isOwnUser: boolean;
  translate: TranslateFunction;
  canChat: boolean;
}): JSX.Element => {
  const userProfileUrl = `${EnvironmentUrls.websiteUrl}/users/${friend.id}/profile`;
  const displayName = friend.combinedName;

  const presence = Presence.usePresence(friend.id, undefined);

  const isInGame = presence != null && presence.gameId != null;

  const userPresenceFull = isInGame ? presence.lastLocation : null;

  const userPresence =
    userPresenceFull != null && userPresenceFull.length > 15
      ? `${userPresenceFull.slice(0, 15)}...`
      : userPresenceFull;

  const gameUrl = isInGame ? `${EnvironmentUrls.websiteUrl}/games/${presence.placeId ?? ''}` : '';

  return (
    <div className='friends-carousel-tile'>
      <FriendTilePopover
        trigger={
          <button
            type='button'
            className='options-dropdown'
            id='friend-tile-button'
            onClick={() => {
              /* This component needs to a be a button, but it's onClick should not do anything. */
            }}>
            <FriendTileContent
              id={friend.id}
              displayName={displayName}
              userProfileUrl={userProfileUrl}
              userPresence={userPresence}
              translate={translate}
              hasVerifiedBadge={friend.hasVerifiedBadge}
            />
          </button>
        }
        content={
          isOwnUser ? (
            <FriendTileDropDown
              friend={friend}
              isInGame={isInGame}
              universeId={presence.universeId ?? 0}
              displayName={displayName}
              userProfileUrl={userProfileUrl}
              userPresence={userPresenceFull}
              translate={translate}
              gameUrl={gameUrl}
              canChat={canChat}
            />
          ) : (
            <div />
          )
        }
        dropdownWidth={userPresence == null ? DROPDOWN_WIDTH : DROPDOWN_WIDTH_INGAME}
      />
    </div>
  );
};

export default FriendTile;
