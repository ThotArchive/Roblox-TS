import React from 'react';
import { common } from '../../common/constants/configConstants';

const { keyBoardEventCode } = common;

type ScrollerBarProps = {
  scrollClassNames: string;
  scrollIconClassName: string;
  scroll: () => void;
  isDisabled: boolean;
  isNewScrollArrowsEnabled: boolean;
};

const ScrollerBar = ({
  scrollClassNames,
  scrollIconClassName,
  scroll,
  isDisabled,
  isNewScrollArrowsEnabled
}: ScrollerBarProps): JSX.Element => {
  return (
    <div
      data-testid='game-carousel-scroll-bar'
      className={scrollClassNames}
      onClick={scroll}
      aria-disabled={isDisabled}
      onKeyDown={e => {
        if (e.code === keyBoardEventCode.enter) {
          e.stopPropagation();
          e.preventDefault();
          scroll();
        }
      }}
      role='button'
      tabIndex={0}>
      {isNewScrollArrowsEnabled ? (
        <span className={scrollIconClassName} />
      ) : (
        <React.Fragment>
          <div className='arrow'>
            <span className={scrollIconClassName} />
          </div>
          <div className='spacer' />
        </React.Fragment>
      )}
    </div>
  );
};

export default ScrollerBar;
