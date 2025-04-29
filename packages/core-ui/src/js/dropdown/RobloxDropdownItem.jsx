import PropTypes from "prop-types";
import MenuItem from "react-bootstrap/lib/MenuItem";

function RobloxDropdownItem({ children, ...otherProps }) {
  return <MenuItem {...otherProps}>{children}</MenuItem>;
}

RobloxDropdownItem.defaultProps = {
  children: null,
};

RobloxDropdownItem.propTypes = {
  children: PropTypes.node,
};

export default RobloxDropdownItem;
