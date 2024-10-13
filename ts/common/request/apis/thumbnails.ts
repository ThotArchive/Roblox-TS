/* eslint-disable import/prefer-default-export */

import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Thumbnails from '../types/thumbnails';

export const getIconsForUniverseIds = (
  universeIds: string[],
  size: Thumbnails.IconSize,
  format: Thumbnails.IconFormat,
  isCircular: boolean
): Promise<
  Result<Thumbnails.GetIconsForUniverseIdsReturnType, Thumbnails.ThumbnailsError | null>
> =>
  toResult(
    httpService.get(Thumbnails.GET_ICONS_FOR_UNIVERSE_IDS_CONFIG, {
      universeIds,
      size,
      format,
      isCircular
    }),
    Thumbnails.ThumbnailsError
  );
