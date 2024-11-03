import React from 'react';
import { DeviceMeta, GameLauncher, ProtocolHandlerClientInterface } from 'Roblox';
import { TranslateFunction } from 'react-utilities';
import { Button } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from 'roblox-thumbnails';
import { TFriend } from '../types/friendsCarouselTypes';
import chatCorescriptsService from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/services/chatService/chatService';

const FriendTileDropdown = ({
  friend,
  displayName,
  userProfileUrl,
  userPresence,
  isInGame,
  gameUrl,
  universeId,
  canChat,
  translate
}: {
  friend: TFriend;
  displayName: string;
  userProfileUrl: string;
  userPresence: string | null | undefined;
  isInGame: boolean;
  gameUrl: string;
  universeId: number;
  canChat: boolean;
  translate: TranslateFunction;
}): JSX.Element => {
  const launchGame = async () => {
    const joinAttemptId = friend.presence.gameId || '';
    if (DeviceMeta().isInApp) {
      if (DeviceMeta().isDesktop) {
        GameLauncher.followPlayerIntoGame(friend.id, joinAttemptId, 'JoinUser');
      } else {
        window.location.href = `/games/start?userID=${friend.id}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
      }
    } else if (DeviceMeta().isAndroidDevice || DeviceMeta().isChromeOs) {
      window.location.href = `intent://userId=${friend.id}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser#Intent;scheme=robloxmobile;package=com.roblox.client;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.roblox.client;end`;
    } else if (DeviceMeta().isIosDevice) {
      window.location.href = `robloxmobile://userId=${friend.id}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    } else {
      await ProtocolHandlerClientInterface.followPlayerIntoGame({
        userId: friend.id,
        joinAttemptId,
        joinAttemptOrigin: 'JoinUser'
      });
    }
  };

  const startChat = () => {
    chatCorescriptsService.startDesktopAndMobileWebChat({ userId: friend.id });
  };

  return (
    <div className='friend-tile-dropdown'>
      {isInGame && userPresence != null && (
        <div className='in-game-friend-card'>
          <button
            type='button'
            className='friend-tile-non-styled-button'
            onClick={() => {
              window.open(gameUrl);
            }}>
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={ThumbnailGameIconSize.size150}
              targetId={universeId}
              imgClassName='game-card-thumb'
              containerClass='friend-tile-game-card'
            />
          </button>
          <div className='friend-presence-info'>
            <button
              type='button'
              className='friend-tile-non-styled-button'
              onClick={() => {
                window.open(gameUrl);
              }}>
              {userPresence}
            </button>
            <Button
              variant={Button.variants.growth}
              size={Button.sizes.small}
              width={Button.widths.full}
              onClick={launchGame}>
              {translate('Action.Join')}
            </Button>
          </div>
        </div>
      )}
      <ul>
        {canChat && (
          <li>
            <button type='button' className='friend-tile-dropdown-button' onClick={startChat}>
              <span className='icon icon-chat-gray' />{' '}
              {translate('Label.Chat', { username: displayName })}
            </button>
          </li>
        )}
        <li>
          <button
            type='button'
            className='friend-tile-dropdown-button'
            onClick={() => {
              window.open(userProfileUrl);
            }}>
            <span className='icon icon-viewdetails' /> {translate('Label.ViewProfile')}
          </button>
        </li>
      </ul>
    </div>
  );
};
export default FriendTileDropdown;
