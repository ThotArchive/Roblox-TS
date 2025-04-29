import React from 'react';
import { Thumbnail2d, ThumbnailFormat } from 'roblox-thumbnails';
import { TSupportedThumbnailSize } from '../system/SduiParsers';
import '../style/_thumbnailImage.scss';

type TSduiThumbnailImageProps = {
  thumbnailType: string;
  targetId: string;
  format: ThumbnailFormat;
  size: TSupportedThumbnailSize;
};

/**
 * Returns a Thumbnail2d component with container styles through thumbnailImage.scss
 * that create a transparent background and 100% width and height.
 *
 * Rendered by SduiParsers.parseAssetUrlIntoComponent when converting
 * an rbxthumb:// URL into a component.
 */
const SduiThumbnailImage = ({
  thumbnailType,
  targetId,
  format,
  size
}: TSduiThumbnailImageProps): JSX.Element => {
  return (
    <Thumbnail2d
      containerClass='sdui-thumbnail-image-container'
      type={thumbnailType}
      targetId={targetId}
      format={format}
      size={size}
    />
  );
};

export default SduiThumbnailImage;
