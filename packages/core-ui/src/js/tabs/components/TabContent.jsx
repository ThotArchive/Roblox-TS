import PropTypes from "prop-types";
import classNames from "classnames";

function TabContent({ isActive, className, children }) {
  const tabContentClass = classNames(className, "tab-pane", {
    active: isActive,
  });
  return (
    <div role="tabpanel" className={tabContentClass}>
      {children}
    </div>
  );
}

TabContent.defaultProps = {
  isActive: false,
  className: null,
  children: null,
};

TabContent.propTypes = {
  isActive: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default TabContent;
