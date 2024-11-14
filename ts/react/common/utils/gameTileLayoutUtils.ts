import { TileBadgePositionEnum } from '../constants/genericTileConstants';
import {
  TGameTileBadgeType,
  TGameTilePillData,
  TGameTileTextFooter,
  TLayoutComponentType,
  TLayoutMetadata,
  TTileBadge
} from '../types/bedev1Types';

export const getGameTilePillsIconClass = (icon: string): string | null => {
  switch (icon) {
    case 'icons/menu/gem_small':
      return 'icon-gem-dark-stroke';
    default:
      return null;
  }
};

export const getGameTilePillsAnimationClass = (tileBadge: TTileBadge): string | null => {
  return tileBadge.isShimmerEnabled ? 'shimmer-animation' : null;
};

export const getGameTilePillsPositionClass = (position: TileBadgePositionEnum): string => {
  switch (position) {
    case TileBadgePositionEnum.IMAGE_TOP_LEFT:
      return 'game-card-pill-top-left';
    default:
      return '';
  }
};

export type TGameTilesPillsByPosition = Partial<Record<TileBadgePositionEnum, TGameTilePillData[]>>;

export const getGameTilePillsData = (
  gameLayoutData: TLayoutMetadata | undefined
): TGameTilesPillsByPosition | null => {
  let topLeftPillsData: TGameTilePillData[] = [];
  const topLeftBadge = gameLayoutData?.tileBadgesByPosition?.ImageTopLeft;
  if (topLeftBadge && topLeftBadge.length) {
    topLeftPillsData = topLeftBadge.map(tileBadge => {
      const badgeData: TGameTilePillData = {
        id: tileBadge.analyticsId
      };
      if (tileBadge.tileBadgeType === TGameTileBadgeType.Text && tileBadge.text) {
        badgeData.text = tileBadge.text;
        badgeData.animationClass = getGameTilePillsAnimationClass(tileBadge);
      } else if (tileBadge.tileBadgeType === TGameTileBadgeType.Icon && tileBadge.icons) {
        const icons = tileBadge.icons
          .map(icon => getGameTilePillsIconClass(icon))
          .filter(icon => !!icon) as string[];
        badgeData.icons = icons;
        badgeData.animationClass = getGameTilePillsAnimationClass(tileBadge);
      }
      return badgeData;
    });
  }
  if (topLeftPillsData.length) {
    return {
      [TileBadgePositionEnum.IMAGE_TOP_LEFT]: topLeftPillsData
    };
  }
  return null;
};

export const getGameTileTextFooterData = (
  gameLayoutData: TLayoutMetadata | undefined
): TGameTileTextFooter | null => {
  return gameLayoutData?.footer?.type === TLayoutComponentType.TextLabel
    ? gameLayoutData.footer
    : null;
};

export default {
  getGameTilePillsData,
  getGameTilePillsIconClass,
  getGameTilePillsAnimationClass,
  getGameTilePillsPositionClass,
  getGameTileTextFooterData
};
