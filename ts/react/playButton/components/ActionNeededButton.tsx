import React from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonConstants from '../constants/playButtonConstants';
import playButtonTranslationConfig from '../../../../translation.config';

const { playButtonTextTranslationMap } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TActionNeededProps = {
  onButtonClick: (e: React.MouseEvent<Element>) => void;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

export const ActionNeededButton = ({
  onButtonClick,
  iconClassName = 'icon-status-private-primary',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-action-needed-lg',
  hideButtonText = false,
  translate
}: TActionNeededProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  return (
    <React.Fragment>
      <Button
        data-testid='play-action-needed-button'
        width={buttonWidth}
        className={buttonClassName}
        onClick={onButtonClick}>
        <span className={iconClassName} />
        {!hideButtonText && (
          <span className='btn-text'>{translate(playButtonTextTranslationMap.ActionNeeded)}</span>
        )}
      </Button>
      <div id='access-management-upsell-container-v1' />
    </React.Fragment>
  );
};

export default withTranslations<TActionNeededProps>(
  ActionNeededButton,
  playButtonTranslationConfig
);
