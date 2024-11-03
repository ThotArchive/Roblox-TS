import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize
} from 'roblox-thumbnails';
import playerConstants from '../constants/playerConstants';

function CurrentPlayingGame({ game, translate }) {
  const { universeId, name, referralUrl, isPlayable } = game;

  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.gameIcon}
      size={DefaultThumbnailSize}
      targetId={universeId}
      imgClassName='game-card-thumb'
      format={ThumbnailFormat.jpeg}
    />
  );
  return (
    <div className='border-bottom player-interaction-container'>
      <span className='cursor-pointer game-icon'>
        <Link url={referralUrl} className='game-card-link'>
          {thumbnail}
        </Link>
      </span>
      <span className='game-info-container'>
        <Link url={referralUrl} className='game-name'>
          {name}
        </Link>
        {!isPlayable && (
          <Link url={referralUrl} className='btn-control-sm game-link'>
            {translate(playerConstants.viewGameDetails)}
          </Link>
        )}
      </span>
    </div>
  );
}

CurrentPlayingGame.propTypes = {
  game: PropTypes.shape({
    universeId: PropTypes.number,
    placeId: PropTypes.number,
    name: PropTypes.string,
    playerCount: PropTypes.number,
    isShowSponsoredLabel: PropTypes.bool,
    nativeAdData: PropTypes.string,
    imageUrl: PropTypes.string,
    referralUrl: PropTypes.string,
    isPlayable: PropTypes.bool
  }).isRequired,
  translate: PropTypes.func.isRequired
};

export default CurrentPlayingGame;
