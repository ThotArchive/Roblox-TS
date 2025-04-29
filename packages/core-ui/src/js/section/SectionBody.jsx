import PropTypes from "prop-types";
import classNames from "classnames";

function SectionBody({ className, children, ...otherProps }) {
  const cssClasses = classNames("col-xs-12 section-content", className);
  return (
    <div className={cssClasses} {...otherProps}>
      {children}
    </div>
  );
}

SectionBody.defaultProps = {
  className: "",
  children: null,
};

SectionBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default SectionBody;
