import PropTypes from "prop-types";
import classNames from "classnames";
import SectionHeader from "./SectionHeader";
import SectionBody from "./SectionBody";

function Section({ className, children, ...otherProps }) {
  const cssClasses = classNames("section", className);
  return (
    <div className={cssClasses} {...otherProps}>
      {children}
    </div>
  );
}

Section.defaultProps = {
  className: "",
  children: null,
};

Section.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Section.Header = SectionHeader;
Section.Body = SectionBody;

export default Section;
