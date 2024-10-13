import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bannerTypes from '../constants/bannerTypes';

function SystemFeedback({
  bannerText,
  bannerType,
  showBanner,
  showCloseButton,
  onCloseClick,
  onCloseKeyDown
}) {
  const cssClass = classNames('alert', bannerType, { on: showBanner });
  return (
    <div className='sg-system-feedback'>
      <div className='alert-system-feedback'>
        <div className={cssClass}>
          <span className='alert-content'>{bannerText}</span>
          {showCloseButton && (
            <span
              role='button'
              tabIndex='-1'
              aria-label='Close'
              className='icon-close-white'
              onClick={onCloseClick}
              onKeyDown={onCloseKeyDown}
            />
          )}
        </div>
      </div>
    </div>
  );
}

SystemFeedback.defaultProps = {
  bannerText: '',
  bannerType: '',
  onCloseClick: null,
  onCloseKeyDown: null,
  showBanner: false,
  showCloseButton: false
};

SystemFeedback.propTypes = {
  bannerText: PropTypes.string,
  bannerType: PropTypes.oneOf(Object.values(bannerTypes)),
  onCloseClick: PropTypes.func,
  onCloseKeyDown: PropTypes.func,
  showBanner: PropTypes.bool,
  showCloseButton: PropTypes.bool
};

export default SystemFeedback;
