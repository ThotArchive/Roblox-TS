import PropTypes from "prop-types";
import classNames from "classnames";

function TabsContainer({ isScrollable, className, children, isVertical, ...otherProps }) {
  const containerClassNames = classNames(className, {
    "rbx-tabs-horizontal": !isVertical,
    "rbx-scrollable-tabs-horizontal": isScrollable,
  });

  return (
    <div {...otherProps} className={containerClassNames}>
      {children}
    </div>
  );
}

TabsContainer.defaultProps = {
  children: null,
  className: null,
  isScrollable: false,
  isVertical: false,
};

TabsContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isScrollable: PropTypes.bool,
  isVertical: PropTypes.bool,
};

export default TabsContainer;
