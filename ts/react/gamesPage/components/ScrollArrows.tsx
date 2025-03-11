import React from 'react';
import classNames from 'classnames';
import ScrollerBar from './ScrollerBar';

type TScrollArrowsProps = {
  hideScrollBackWhenDisabled?: boolean;
  isScrollBackDisabled: boolean;
  isScrollForwardDisabled: boolean;
  onScrollBack: () => void;
  onScrollForward: () => void;
  isNewScrollArrowsEnabled?: boolean;
};

/**
 * Renders the left and right scroll arrows on top of a scrollable carousel
 */
const ScrollArrows = ({
  hideScrollBackWhenDisabled = false,
  isScrollBackDisabled,
  isScrollForwardDisabled,
  onScrollBack,
  onScrollForward,
  isNewScrollArrowsEnabled
}: TScrollArrowsProps): JSX.Element => {
  if (isNewScrollArrowsEnabled) {
    return (
      <React.Fragment>
        {!isScrollBackDisabled && (
          <ScrollerBar
            scrollClassNames='scroller-new prev'
            scrollIconClassName='icon-chevron-heavy-left'
            scroll={onScrollBack}
            // Clean up isDisabled prop to ScrollerBar with isNewScrollArrowsEnabled
            isDisabled={isScrollBackDisabled}
            isNewScrollArrowsEnabled
          />
        )}
        {!isScrollForwardDisabled && (
          <ScrollerBar
            scrollClassNames='scroller-new next'
            scrollIconClassName='icon-chevron-heavy-right'
            scroll={onScrollForward}
            // Clean up isDisabled prop to ScrollerBar with isNewScrollArrowsEnabled
            isDisabled={isScrollForwardDisabled}
            isNewScrollArrowsEnabled
          />
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {hideScrollBackWhenDisabled && isScrollBackDisabled ? null : (
        <ScrollerBar
          scrollClassNames={classNames('scroller', 'prev', { disabled: isScrollBackDisabled })}
          scrollIconClassName='icon-games-carousel-left'
          isDisabled={isScrollBackDisabled}
          scroll={onScrollBack}
          isNewScrollArrowsEnabled={false}
        />
      )}
      <ScrollerBar
        scrollClassNames={classNames('scroller', 'next', { disabled: isScrollForwardDisabled })}
        scrollIconClassName='icon-games-carousel-right'
        isDisabled={isScrollForwardDisabled}
        scroll={onScrollForward}
        isNewScrollArrowsEnabled={false}
      />
    </React.Fragment>
  );
};

ScrollArrows.defaultProps = {
  isNewScrollArrowsEnabled: undefined
};

export default ScrollArrows;
