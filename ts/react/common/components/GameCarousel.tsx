import React, { forwardRef, MutableRefObject } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { TBuildEventProperties } from './GameTileUtils';
import { TGameData, TGetFriendsResponse } from '../types/bedev1Types';
import {
  TComponentType,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle
} from '../types/bedev2Types';
import GameTileTypeMap from './GameTileTypeMap';
import '../../../../css/common/_gameCarousel.scss';

export type TGameCarouselProps = {
  gameData: TGameData[];
  friendData?: TGetFriendsResponse[];
  translate: WithTranslationsProps['translate'];
  buildEventProperties: TBuildEventProperties;
  tileRef?: MutableRefObject<HTMLDivElement | null>;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  hoverStyle?: THoverStyle;
  topicId?: string;
  isExpandHomeContentEnabled?: boolean;
};

export const GameCarousel = forwardRef<HTMLDivElement, TGameCarouselProps>(
  (
    {
      gameData,
      buildEventProperties,
      translate,
      friendData,
      componentType,
      playerCountStyle,
      playButtonStyle,
      navigationRootPlaceId,
      isSponsoredFooterAllowed,
      hoverStyle,
      topicId,
      isExpandHomeContentEnabled,
      tileRef
    }: TGameCarouselProps,
    forwardedRef
  ) => {
    const carouselClassName = classNames(
      'game-carousel',
      {
        'wide-game-tile-carousel':
          componentType === TComponentType.GridTile || componentType === TComponentType.EventTile
      },
      {
        'expand-home-content': isExpandHomeContentEnabled
      },
      {
        'expand-home-content-disabled': !isExpandHomeContentEnabled
      }
    );

    return (
      <div data-testid='game-carousel' ref={forwardedRef} className={carouselClassName}>
        {gameData.map((data, positionId) => (
          <GameTileTypeMap
            componentType={componentType}
            playerCountStyle={playerCountStyle}
            playButtonStyle={playButtonStyle}
            navigationRootPlaceId={navigationRootPlaceId}
            isSponsoredFooterAllowed={isSponsoredFooterAllowed}
            hoverStyle={hoverStyle}
            topicId={topicId}
            ref={tileRef}
            // eslint-disable-next-line react/no-array-index-key
            key={positionId}
            id={positionId}
            gameData={data}
            translate={translate}
            buildEventProperties={buildEventProperties}
            friendData={friendData}
          />
        ))}
      </div>
    );
  }
);
GameCarousel.displayName = 'GameCarousel';
export default GameCarousel;
