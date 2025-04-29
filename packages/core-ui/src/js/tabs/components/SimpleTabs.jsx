import React from "react";
import PropTypes from "prop-types";
import { HashRouter, BrowserRouter, NavLink, Switch, Redirect } from "react-router-dom";
import classNames from "classnames";
import TabNav from "./TabNav";
import TabNavs from "./TabNavs";
import TabContents from "./TabContents";
import TabContainer from "./TabsContainer";
import SimpleTab from "./SimpleTab";
import ROUTER_TYPES from "../constants/routerTypes";
import ROUTER_PROPS from "../constants/routerProps";

function SimpleTabs({ type, isScrollable, children, isVertical, ...otherProps }) {
  let indexRoute;
  const tabElements = [];
  const tabLinkClassnames = classNames({
    "menu-option-content": isVertical,
    "rbx-tab-heading": !isVertical,
  });
  const tabLabelClassNames = classNames({
    "font-caption-header": isVertical,
    "text-lead": !isVertical,
  });
  React.Children.forEach(
    children,
    ({ props: { path, title, subtitle, name, isDefault, className, id } }) => {
      tabElements.push(
        <TabNav key={name} className={className} id={id} isVertical={isVertical}>
          <NavLink to={path} className={tabLinkClassnames} activeClassName="active">
            <span className={tabLabelClassNames}>{title}</span>
            <span className="rbx-tab-subtitle">{subtitle}</span>
          </NavLink>
        </TabNav>,
      );
      if (isDefault) indexRoute = <Redirect from="/" to={path} />;
    },
  );

  const routerProps = {};
  const nonRouterProps = {};
  Object.keys(otherProps).forEach(propName => {
    // Worth making a util out of this pattern?
    if (Object.prototype.hasOwnProperty.call(ROUTER_PROPS[type], propName)) {
      routerProps[propName] = otherProps[propName];
    } else {
      nonRouterProps[propName] = otherProps[propName];
    }
  });

  const Router = type === ROUTER_TYPES.Browser ? BrowserRouter : HashRouter;
  return (
    <TabContainer {...nonRouterProps} isScrollable={isScrollable} isVertical={isVertical}>
      <Router {...routerProps}>
        <TabNavs isVertical={isVertical}>{tabElements}</TabNavs>
        <TabContents>
          <Switch>
            {children}
            {indexRoute}
          </Switch>
        </TabContents>
      </Router>
    </TabContainer>
  );
}

SimpleTabs.defaultProps = {
  type: ROUTER_TYPES.Hash,
  isScrollable: false,
  children: null,
  isVertical: false,
};

SimpleTabs.propTypes = {
  type: PropTypes.oneOf(Object.values(ROUTER_TYPES)),
  isScrollable: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  isVertical: PropTypes.bool,
};

SimpleTabs.types = ROUTER_TYPES;
SimpleTabs.Tab = SimpleTab;

export default SimpleTabs;
