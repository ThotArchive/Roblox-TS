import React from 'react';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize
} from 'roblox-thumbnails';
import { VisualItemThumbnail, ThumbnailType } from '../types/NotificationTemplateTypes';

const ThumbnailData: {
  [key: string]: {
    type: ThumbnailTypes;
    class: string;
    format: ThumbnailFormat;
  };
} = {
  [ThumbnailType.User]: {
    type: ThumbnailTypes.avatarHeadshot,
    class: 'avatar-icon-container',
    format: ThumbnailFormat.webp
  },
  [ThumbnailType.Game]: {
    type: ThumbnailTypes.gameIcon,
    class: 'game-icon-container',
    format: ThumbnailFormat.webp
  },
  [ThumbnailType.Group]: {
    type: ThumbnailTypes.groupIcon,
    class: 'group-icon-container',
    format: ThumbnailFormat.webp
  },
  [ThumbnailType.Asset]: {
    type: ThumbnailTypes.assetThumbnail,
    class: 'asset-icon-container',
    format: ThumbnailFormat.webp
  },
  [ThumbnailType.Bundle]: {
    type: ThumbnailTypes.bundleThumbnail,
    class: 'asset-icon-container',
    format: ThumbnailFormat.webp
  }
};

const iconClassMap: { [icon: string]: string } = {
  reported: 'icon-status-alert-xl',
  roblox: 'icon-logo-r-silver-blackbg',
  premium: 'icon-default-premium',
  safety: 'icon-default-safety'
};

export type NotificationThumbnailProps = {
  thumbnailItem: VisualItemThumbnail | undefined;
};

export const NotificationThumbnail = ({
  thumbnailItem
}: NotificationThumbnailProps): JSX.Element | null => {
  if (thumbnailItem && thumbnailItem.idType === ThumbnailType.Icon) {
    return <span className={iconClassMap[thumbnailItem.id] || ''} />;
  }

  const thumbnailSettings = thumbnailItem && ThumbnailData[thumbnailItem.idType];
  if (!thumbnailItem || !thumbnailSettings) {
    return null;
  }

  return thumbnailItem.idType === ThumbnailType.User ? (
    <div className='avatar avatar-headshot-sm avatar-sndr-overides'>
      <div className='avatar-card-image'>
        <Thumbnail2d
          type={thumbnailSettings.type}
          size={DefaultThumbnailSize}
          format={ThumbnailFormat.webp}
          targetId={parseFloat(thumbnailItem.id)}
          containerClass={thumbnailSettings.class}
        />
      </div>
    </div>
  ) : (
    <Thumbnail2d
      type={thumbnailSettings.type}
      size={DefaultThumbnailSize}
      format={thumbnailSettings.format}
      targetId={parseFloat(thumbnailItem.id)}
      containerClass={thumbnailSettings.class}
    />
  );
};

export default NotificationThumbnail;
