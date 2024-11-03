import React from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonConstants from '../constants/playButtonConstants';
import { startAccessManagementUpsellFlow } from '../utils/playButtonUtils';
import playButtonTranslationConfig from '../../../../translation.config';

const { playButtonTextTranslationMap } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TActionNeededProps = {
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

export const ActionNeededButton = ({
  translate,
  iconClassName = 'icon-status-private-primary',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-action-needed-lg',
  hideButtonText = false
}: TActionNeededProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  const handleClick = async (e: React.MouseEvent<Element>) => {
    e.preventDefault();
    e.stopPropagation();
    // result can be used for success/failure callback cases in the future
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const success = await startAccessManagementUpsellFlow();
  };

  return (
    <React.Fragment>
      <Button
        data-testid='play-action-needed-button'
        width={buttonWidth}
        className={buttonClassName}
        onClick={handleClick}>
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
