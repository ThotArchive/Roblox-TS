import React, { Fragment } from 'react';
import {
  getGameTilePillsPositionClass,
  TGameTilesPillsByPosition
} from '../utils/gameTileLayoutUtils';
import GameTilePillWithAnimation from './GameTilePillWithAnimation';

interface GameTilePillsContainerProps {
  pills: TGameTilesPillsByPosition;
  isFocused?: boolean;
}

const GameTilePillsContainer: React.FC<GameTilePillsContainerProps> = ({ pills, isFocused }) => {
  const positionKeys = Object.keys(pills) as (keyof TGameTilesPillsByPosition)[];
  const hasPills = (key: keyof TGameTilesPillsByPosition) => {
    return !!pills[key]?.length;
  };

  return (
    <Fragment>
      {positionKeys.map(
        key =>
          hasPills(key) && (
            <div
              key={key}
              className={`game-card-pills-container ${getGameTilePillsPositionClass(key)}`}>
              {pills[key]?.map(pill => (
                <GameTilePillWithAnimation
                  key={pill.id}
                  id={pill.id}
                  animationClass={pill.animationClass}
                  icons={pill.icons}
                  text={pill.text}
                  isFocused={isFocused}
                />
              ))}
            </div>
          )
      )}
    </Fragment>
  );
};

export default GameTilePillsContainer;
