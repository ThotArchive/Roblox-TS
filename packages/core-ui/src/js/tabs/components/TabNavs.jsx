import PropTypes from "prop-types";
import classNames from "classnames";

function TabNavs({ children, isVertical }) {
  const listClassNames = classNames({
    "menu-vertical": isVertical,
    "nav nav-tabs": !isVertical,
  });

  return (
    <ul className={listClassNames} role="tablist">
      {children}
    </ul>
  );
}

TabNavs.defaultProps = {
  children: null,
  isVertical: false,
};

TabNavs.propTypes = {
  children: PropTypes.node,
  isVertical: PropTypes.bool,
};

export default TabNavs;
