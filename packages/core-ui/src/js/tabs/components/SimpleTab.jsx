import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import TabContent from "./TabContent";

function SimpleTab({ path, isActive, className, children, ...routeProps }) {
  return (
    <Route
      {...routeProps}
      path={path}
      render={() => (
        // Set isActive to always true because Route already handles the show/hide logic
        <TabContent isActive className={className}>
          {children}
        </TabContent>
      )}
    />
  );
}

SimpleTab.defaultProps = {
  path: null,
  isActive: false,
  className: null,
  children: null,
};

SimpleTab.propTypes = {
  path: PropTypes.string,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default SimpleTab;
