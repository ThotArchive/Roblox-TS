import React, { forwardRef, MutableRefObject } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { TGameData, TGetFriendsResponse } from '../types/bedev1Types';
import { SentinelTile } from './SentinelTile';
import { TBuildEventProperties } from './GameTileUtils';
import {
  TComponentType,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle
} from '../types/bedev2Types';
import '../../../../css/common/_gameGrid.scss';
import GameGridTile from './GameGridTile';

export type TGameGridProps = {
  gameData: TGameData[];
  emphasis: boolean;
  translate: WithTranslationsProps['translate'];
  buildEventProperties: TBuildEventProperties;
  tileRef?: MutableRefObject<HTMLDivElement | null>;
  loadData?: () => void;
  shouldUseSentinelTile?: boolean;
  friendsPresence?: TGetFriendsResponse[];
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  topicId?: string;
  isHomeGameGrid?: boolean;
  isSponsoredFooterAllowed?: boolean;
  hoverStyle?: THoverStyle;
  isExpandHomeContentEnabled?: boolean;
  interestedUniverses?: Set<number>;
  toggleInterest?: (universeId: number) => void;
};

export const GameGrid = forwardRef<HTMLDivElement, TGameGridProps>(
  (
    {
      gameData,
      translate,
      emphasis,
      buildEventProperties,
      tileRef,
      loadData,
      shouldUseSentinelTile,
      friendsPresence,
      componentType,
      playerCountStyle,
      playButtonStyle,
      isHomeGameGrid,
      isSponsoredFooterAllowed,
      hoverStyle,
      topicId,
      isExpandHomeContentEnabled,
      interestedUniverses,
      toggleInterest
    }: TGameGridProps,
    forwardedRef
  ) => {
    const gridClassName = classNames(
      'game-grid',
      {
        'home-game-grid': isHomeGameGrid
      },
      {
        'wide-game-tile-game-grid':
          componentType === TComponentType.GridTile ||
          componentType === TComponentType.EventTile ||
          componentType === TComponentType.InterestTile
      },
      {
        'interest-tile-game-grid': componentType === TComponentType.InterestTile
      },
      {
        'expand-home-content': isExpandHomeContentEnabled
      },
      {
        'expand-home-content-disabled': !isExpandHomeContentEnabled
      }
    );

    return (
      <div data-testid='game-grid' ref={forwardedRef} className={gridClassName}>
        {gameData.map((data, positionId) => (
          <GameGridTile
            ref={ref => {
              if (
                ((emphasis === true && positionId === 1) ||
                  (emphasis === false && positionId === 0)) &&
                tileRef
              ) {
                // eslint-disable-next-line no-param-reassign
                tileRef.current = ref;
              }
            }}
            key={data.universeId}
            id={positionId}
            gameData={data}
            translate={translate}
            buildEventProperties={buildEventProperties}
            emphasis={emphasis === true && positionId === 0 && !isHomeGameGrid}
            friendData={friendsPresence}
            componentType={componentType}
            playerCountStyle={playerCountStyle}
            playButtonStyle={playButtonStyle}
            isSponsoredFooterAllowed={isSponsoredFooterAllowed}
            hoverStyle={hoverStyle}
            topicId={topicId}
            isInterestedUniverse={interestedUniverses?.has(data.universeId)}
            toggleInterest={toggleInterest ? () => toggleInterest(data.universeId) : undefined}
          />
        ))}
        {shouldUseSentinelTile && <SentinelTile loadData={loadData} />}
      </div>
    );
  }
);

GameGrid.displayName = 'GameGrid';
GameGrid.defaultProps = {
  friendsPresence: [],
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  isHomeGameGrid: false,
  isSponsoredFooterAllowed: undefined,
  hoverStyle: undefined,
  topicId: undefined,
  isExpandHomeContentEnabled: undefined,
  interestedUniverses: undefined,
  toggleInterest: undefined
};

export default GameGrid;
