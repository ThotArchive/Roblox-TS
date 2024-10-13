import {
  ThumbnailStates,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailAvatarHeadshotSize,
  ThumbnailGameIconSize,
  ThumbnailAvatarsSize
} from '../../../../ts/2d/constants/thumbnail2dConstant';

import thumbnailsModule from '../thumbnailsModule';

const thumbnailConstants = {
  thumbnailTypes: ThumbnailTypes,

  thumbnailStates: ThumbnailStates,

  formats: ThumbnailFormat,

  avatarHeadshotSize: ThumbnailAvatarHeadshotSize,

  gameIconSize: ThumbnailGameIconSize,

  thumbnailAvatarsSize: ThumbnailAvatarsSize
};

thumbnailsModule.constant('thumbnailConstants', thumbnailConstants);

export default thumbnailConstants;
