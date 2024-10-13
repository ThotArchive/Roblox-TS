import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function TabNav({ isActive, className, children, isVertical, ...otherProps }) {
  const tabClass = classNames(className, {
    active: isActive,
    'menu-option': isVertical,
    'rbx-tab': !isVertical
  });
  return (
    <li {...otherProps} role='tab' className={tabClass}>
      {children}
    </li>
  );
}

TabNav.defaultProps = {
  isActive: false,
  className: null,
  children: null,
  isVertical: false
};

TabNav.propTypes = {
  isActive: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  isVertical: PropTypes.bool
};

export default TabNav;
