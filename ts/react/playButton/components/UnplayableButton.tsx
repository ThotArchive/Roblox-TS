import React from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonConstants from '../constants/playButtonConstants';
import playButtonTranslationConfig from '../../../../translation.config';

const { playButtonTextTranslationMap } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TUnplayableProps = {
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

export const UnplayableButton = ({
  translate,
  iconClassName = 'icon-status-unavailable-secondary',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-unplayable-lg',
  hideButtonText = false
}: TUnplayableProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  return (
    <React.Fragment>
      <Button
        data-testid='play-unplayable-button'
        width={buttonWidth}
        className={buttonClassName}
        isDisabled
        onClick={() => null}>
        <span className={iconClassName} />
        {!hideButtonText && (
          <span className='btn-text'>{translate(playButtonTextTranslationMap.Unplayable)}</span>
        )}
      </Button>
    </React.Fragment>
  );
};

export default withTranslations<TUnplayableProps>(UnplayableButton, playButtonTranslationConfig);
