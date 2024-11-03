import React, { forwardRef } from 'react';
import { TComponentType } from '../types/bedev2Types';
import GameTile, { TGameTileProps } from './GameTile';
import WideGameTile, { TWideGameTileProps } from './WideGameTile';

type TTileProps = TGameTileProps | TWideGameTileProps;

export type TGameTileTypeMapProps = TTileProps & {
  componentType?: TComponentType;
};

export const GameTileTypeMap = forwardRef<HTMLDivElement, TGameTileTypeMapProps>(
  ({ componentType, ...tileProps }: TGameTileTypeMapProps, forwardedRef) => {
    switch (componentType) {
      case TComponentType.AppGameTileNoMetadata:
        return <GameTile ref={forwardedRef} shouldShowMetadata={false} {...tileProps} />;
      case TComponentType.GridTile:
      case TComponentType.EventTile:
      case TComponentType.InterestTile:
        return <WideGameTile ref={forwardedRef} wideTileType={componentType} {...tileProps} />;
      default:
        return <GameTile ref={forwardedRef} {...tileProps} />;
    }
  }
);

GameTileTypeMap.displayName = 'GameTileTypeMap';
export default GameTileTypeMap;
