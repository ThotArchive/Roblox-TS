import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function SectionHeader({ className, children, ...otherProps }) {
  const cssClasses = classNames('col-xs-12 container-header', className);
  return (
    <div className={cssClasses} {...otherProps}>
      {children}
    </div>
  );
}

SectionHeader.defaultProps = {
  className: '',
  children: null
};

SectionHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default SectionHeader;
