import React from 'react';
import PropTypes from 'prop-types';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat
} from 'roblox-thumbnails';

function PlayerAvatar({ playerId, altName }) {
  return (
    <div className='avatar-card-link'>
      <Thumbnail2d
        type={ThumbnailTypes.avatarHeadshot}
        size={ThumbnailAvatarHeadshotSize.size48}
        targetId={playerId}
        imgClassName='avatar-card-image'
        format={ThumbnailFormat.webp}
        altName={altName}
      />
    </div>
  );
}

PlayerAvatar.defaultProps = {
  altName: ''
};

PlayerAvatar.propTypes = {
  playerId: PropTypes.number.isRequired,
  altName: PropTypes.string
};

export default PlayerAvatar;
