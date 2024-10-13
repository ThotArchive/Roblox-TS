import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

const Link = React.forwardRef(function link(props, ref) {
  const { url, cssClasses, className, isDisabled, children, ...otherProps } = props;

  const classNames = ClassNames(className, cssClasses, {
    disabled: isDisabled
  });

  return (
    <a className={classNames} href={url} ref={ref} {...otherProps}>
      {children}
    </a>
  );
});

Link.defaultProps = {
  url: undefined,
  className: '',
  cssClasses: '',
  isDisabled: false,
  children: null
};

Link.propTypes = {
  url: PropTypes.string,
  className: PropTypes.string,
  cssClasses: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node
};

export default Link;
