import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

// TODO: old, migrated code
// eslint-disable-next-line react/display-name
const Link = React.forwardRef((props, ref) => {
  const { url, cssClasses, className, isDisabled, children, ...otherProps } = props;

  return (
    <a
      className={classNames(className, cssClasses, {
        disabled: isDisabled,
      })}
      href={url}
      ref={ref}
      {...otherProps}
    >
      {children}
    </a>
  );
});

Link.defaultProps = {
  url: undefined,
  className: "",
  cssClasses: "",
  isDisabled: false,
  children: null,
};

Link.propTypes = {
  url: PropTypes.string,
  className: PropTypes.string,
  cssClasses: PropTypes.string,
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
};

export default Link;
