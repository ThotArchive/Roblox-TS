import React, { forwardRef } from 'react';
import { TGetFriendsResponse } from '../types/bedev1Types';
import { FeaturedGridTile } from './FeaturedGameTile';
import { TSharedGameTileProps } from './GameTileUtils';
import {
  TComponentType,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle
} from '../types/bedev2Types';
import GameTileTypeMap from './GameTileTypeMap';

type TGameGridTileProps = TSharedGameTileProps & {
  emphasis: boolean;
  friendData?: TGetFriendsResponse[];
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  isSponsoredFooterAllowed?: boolean;
  hoverStyle?: THoverStyle;
  isInterestedUniverse?: boolean;
  toggleInterest?: () => void;
};

export const GameGridTile = forwardRef<HTMLDivElement, TGameGridTileProps>(
  (
    {
      emphasis,
      friendData,
      componentType,
      playerCountStyle,
      playButtonStyle,
      isSponsoredFooterAllowed,
      hoverStyle,
      topicId,
      isInterestedUniverse,
      toggleInterest,
      ...props
    }: TGameGridTileProps,
    ref
  ) => {
    if (emphasis) {
      return <FeaturedGridTile ref={ref} {...props} />;
    }

    return (
      <GameTileTypeMap
        ref={ref}
        friendData={friendData}
        componentType={componentType}
        playerCountStyle={playerCountStyle}
        playButtonStyle={playButtonStyle}
        isSponsoredFooterAllowed={isSponsoredFooterAllowed}
        hoverStyle={hoverStyle}
        topicId={topicId}
        isInterestedUniverse={isInterestedUniverse}
        toggleInterest={toggleInterest}
        {...props}
      />
    );
  }
);

GameGridTile.displayName = 'GameGridTile';
GameGridTile.defaultProps = {
  friendData: [],
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  isSponsoredFooterAllowed: undefined,
  hoverStyle: undefined,
  isInterestedUniverse: undefined,
  toggleInterest: undefined
};

export default GameGridTile;
