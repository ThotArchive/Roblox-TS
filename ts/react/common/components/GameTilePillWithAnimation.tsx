import React from 'react';
import classNames from 'classnames';
import { TGameTilePillData } from '../types/bedev1Types';

export interface GameTilePillWithAnimationProps extends TGameTilePillData {
  isFocused?: boolean;
}

const GameTilePillWithAnimation = ({
  animationClass,
  isFocused,
  icons,
  text
}: GameTilePillWithAnimationProps): JSX.Element | null => {
  if (icons?.length || text) {
    return (
      <div className='game-card-pill-with-animation'>
        <div
          className={classNames('game-card-pill-animation-container', {
            [animationClass ?? '']: animationClass && isFocused
          })}>
          {icons?.length &&
            icons.map((iconClass, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={index} className={`game-card-pill-icon ${iconClass}`} />
            ))}
          {text && <div className='game-card-pill-text'>{text}</div>}
        </div>
      </div>
    );
  }

  return null;
};

GameTilePillWithAnimation.defaultProps = {
  animation: undefined
};

export default GameTilePillWithAnimation;
