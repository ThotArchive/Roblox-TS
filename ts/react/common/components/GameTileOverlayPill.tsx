import React from 'react';
import classNames from 'classnames';
import { TLayoutMetadata } from '../types/bedev1Types';
import { TPlayerCountStyle } from '../types/bedev2Types';
import parsingUtils from '../utils/parsingUtils';
import GameTilePillsContainer from './GameTilePillsContainer';
import { getGameTilePillsData } from '../utils/gameTileBadgeUtils';

const GameTilePlayerCount = ({ playerCount }: { playerCount: number }): JSX.Element => {
  const players = parsingUtils.getPlayerCount(playerCount);
  return (
    <div className='game-card-info' data-testid='game-tile-stats-player-count'>
      <span className='info-label icon-playing-counts-gray' />
      <span className='info-label playing-counts-label'>{players}</span>
    </div>
  );
};

const GameTilePlayerCountPill = ({
  playerCount,
  playerCountStyle
}: {
  playerCount: number;
  playerCountStyle?: TPlayerCountStyle;
}): JSX.Element => {
  const playerCountClassName = classNames('game-card-image-pill', {
    'hover-only': playerCountStyle === TPlayerCountStyle.Hover
  });
  return (
    <div className={playerCountClassName} data-testid='game-tile-player-count-pill'>
      <GameTilePlayerCount playerCount={playerCount} />
    </div>
  );
};

GameTilePlayerCountPill.defaultProps = {
  playerCountStyle: undefined
};

const featureIconMap: Record<string, string> = {
  Voice: 'pill-icon icon-default-voice-16x16-white',
  Camera: 'pill-icon icon-default-camera-white'
};

const GameTileFeaturePill = ({ featureTypes }: { featureTypes: string[] }): JSX.Element => {
  return (
    <div className='game-card-image-feature-pill' data-testid='game-tile-social-feature-pill'>
      <div className='game-card-info' data-testid='game-tile-social-feature-list'>
        {featureTypes.map(
          type => featureIconMap[type] && <span key={type} className={featureIconMap[type]} />
        )}
      </div>
    </div>
  );
};

export const GameTileTextPill = ({ text }: { text: string }): JSX.Element => {
  return (
    <div className='game-card-text-pill'>
      <div className='game-card-info'>{text}</div>
    </div>
  );
};

type TGameTileOverlayPillProps = {
  isFocused: boolean;
  gameLayoutData?: TLayoutMetadata;
  playerCountStyle?: TPlayerCountStyle;
  playerCount?: number;
};

const GameTileOverlayPill = ({
  gameLayoutData,
  playerCountStyle,
  playerCount,
  isFocused
}: TGameTileOverlayPillProps): JSX.Element | null => {
  const gameTilePillData = getGameTilePillsData(gameLayoutData);

  if (gameTilePillData) {
    return <GameTilePillsContainer pills={gameTilePillData} isFocused={isFocused} />;
  }

  if (gameLayoutData?.pill?.types && gameLayoutData.pill.types.length > 0) {
    return <GameTileFeaturePill featureTypes={gameLayoutData.pill.types} />;
  }
  if (
    playerCount !== undefined &&
    (playerCountStyle === TPlayerCountStyle.Always || playerCountStyle === TPlayerCountStyle.Hover)
  ) {
    return (
      <GameTilePlayerCountPill playerCount={playerCount} playerCountStyle={playerCountStyle} />
    );
  }

  return null;
};

GameTileOverlayPill.defaultProps = {
  gameLayoutData: undefined,
  playerCountStyle: undefined,
  playerCount: undefined
};

export default GameTileOverlayPill;
