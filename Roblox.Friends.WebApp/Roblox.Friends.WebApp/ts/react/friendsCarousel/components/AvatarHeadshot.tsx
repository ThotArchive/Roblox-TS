import React from 'react';
import { AvatarCardItem } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import Presence from 'roblox-presence';

const AvatarHeadshot = ({
  id,
  userProfileUrl,
  translate
}: {
  id: number;
  userProfileUrl: string;
  translate: TranslateFunction;
}): JSX.Element => {
  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={DefaultThumbnailSize}
      targetId={id}
      containerClass='avatar-card-image'
    />
  );
  return (
    <AvatarCardItem.Headshot
      statusIcon={<Presence.PresenceStatusIcon translate={translate} userId={id} />}
      thumbnail={thumbnail}
      imageLink={userProfileUrl}
    />
  );
};

export default AvatarHeadshot;
