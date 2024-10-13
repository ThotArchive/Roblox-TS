import React from 'react';
import PropTypes from 'prop-types';

function ButtonBase({ className, disabled, children, ...otherProps }) {
  return (
    // Spread other props later to allow override the value of type
    <button type='button' className={className} disabled={disabled} {...otherProps}>
      {children}
    </button>
  );
}

ButtonBase.defaultProps = {
  className: '',
  disabled: false,
  children: null
};

ButtonBase.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  children: PropTypes.node
};

export default ButtonBase;
