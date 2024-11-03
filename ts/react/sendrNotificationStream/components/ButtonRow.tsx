import React from 'react';
import { Button } from 'react-style-guide';
import { ButtonRowProps, ButtonStyle } from '../types/NotificationTemplateTypes';
import { formatText } from '../utils/labelUtils';

const ButtonStyleMapping = {
  [ButtonStyle.Primary]: Button.variants.primary,
  [ButtonStyle.Secondary]: Button.variants.secondary,
  [ButtonStyle.Growth]: Button.variants.growth,
  [ButtonStyle.Alert]: Button.variants.alert
};

const ButtonRow = ({ buttonList, handleActions }: ButtonRowProps): JSX.Element => {
  return (
    <div className='button-row-container'>
      {buttonList.map((button, index) => (
        <Button
          key={button.label.text}
          size={Button.sizes.extraSmall}
          variant={ButtonStyleMapping[button.buttonStyle]}
          className={`${index === 0 ? 'notif-row-left-button' : 'notif-row-right-button'}`}
          onClick={clickEvent => {
            clickEvent.stopPropagation();
            if (handleActions) {
              handleActions(button);
            }
          }}>
          {formatText(button.label)}
        </Button>
      ))}
    </div>
  );
};

export default ButtonRow;
