import { TComponentType } from '../types/bedev2Types';

type TTileDisplayConfig = {
  minTileWidth: number;
  columnGap: number;
  minTilesPerRow: number;
  maxTilesPerRow: number;
};

// Replace with tileDisplayConfigExperimental when cleaning up isCarouselHorizontalScrollEnabled
export const tileDisplayConfig: Record<TComponentType, TTileDisplayConfig> = {
  [TComponentType.GridTile]: {
    minTileWidth: 233,
    columnGap: 16,
    minTilesPerRow: 2,
    maxTilesPerRow: 6
  },
  [TComponentType.EventTile]: {
    minTileWidth: 233,
    columnGap: 16,
    minTilesPerRow: 4,
    maxTilesPerRow: 4
  },
  [TComponentType.InterestTile]: {
    // InterestTile has larger minTileWidth to increase tile sizes in the interest showcase modal
    minTileWidth: 311,
    columnGap: 16,
    minTilesPerRow: 2,
    maxTilesPerRow: 6
  },
  [TComponentType.AppGameTileNoMetadata]: {
    minTileWidth: 150,
    columnGap: 16,
    minTilesPerRow: 3,
    maxTilesPerRow: 12
  },
  [TComponentType.ExperienceEventsTile]: {
    minTileWidth: 233,
    columnGap: 16,
    minTilesPerRow: 2,
    maxTilesPerRow: 3
  }
};

// Config for scrollable desktop carousels on Home page
export const tileDisplayConfigExperimental: Record<TComponentType, TTileDisplayConfig> = {
  ...tileDisplayConfig,
  [TComponentType.EventTile]: {
    minTileWidth: 300,
    columnGap: 16,
    minTilesPerRow: 2,
    maxTilesPerRow: 4
  }
};

export const defaultTileDisplayConfig: TTileDisplayConfig = {
  minTileWidth: 150,
  columnGap: 16,
  minTilesPerRow: 3,
  maxTilesPerRow: 12
};

// Defines the percentage of the next tile to be visible for horizontal scroll
export const fractionalCarouselScrollPeek = 0.3;

export default {
  tileDisplayConfig,
  tileDisplayConfigExperimental,
  fractionalCarouselScrollPeek,
  defaultTileDisplayConfig
};
