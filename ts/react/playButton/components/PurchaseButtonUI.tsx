import React from 'react';
import { Button, Link } from 'react-style-guide';
import { ValueOf } from '../types/playButtonTypes';

type TPurchaseButtonUI = {
  buttonContent: number | string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  redirectUrl?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  iconClassName?: string;
  hideButtonText?: boolean;
  hideButtonIcon?: boolean;
  isPurchasing?: boolean;
};

const PurchaseButtonUI = ({
  buttonWidth,
  buttonClassName,
  iconClassName,
  hideButtonText,
  hideButtonIcon,
  buttonContent,
  onClick,
  isPurchasing,
  redirectUrl
}: TPurchaseButtonUI): JSX.Element => {
  if (redirectUrl) {
    return (
      <Link url={redirectUrl} className='purchase-button-link'>
        <Button
          data-testid='play-purchase-button'
          width={buttonWidth}
          className={buttonClassName}
          onClick={() => {
            return null;
          }}
          isDisabled={isPurchasing}>
          {!hideButtonIcon && <span className={iconClassName} />}
          {!hideButtonText && <span className='btn-text'>{buttonContent}</span>}
        </Button>
      </Link>
    );
  }
  return (
    <Button
      data-testid='play-purchase-button'
      width={buttonWidth}
      className={buttonClassName}
      onClick={e => {
        if (onClick && !isPurchasing) {
          onClick(e);
        }
      }}
      isDisabled={isPurchasing}>
      {!hideButtonIcon && <span className={iconClassName} />}
      {!hideButtonText && <span className='btn-text'>{buttonContent}</span>}
    </Button>
  );
};

PurchaseButtonUI.defaultProps = {
  hideButtonText: false,
  buttonWidth: Button.widths.full,
  buttonClassName: 'btn-common-play-game-lg',
  iconClassName: 'icon-robux-white',
  hideButtonIcon: false,
  isPurchasing: false,
  onClick: undefined,
  redirectUrl: undefined
};

export default PurchaseButtonUI;
