import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/lib/Dropdown';

function RobloxDropdownMenu({ children, ...otherProps }) {
  return <Dropdown.Menu {...otherProps}>{children}</Dropdown.Menu>;
}

RobloxDropdownMenu.defaultProps = {
  children: null
};

RobloxDropdownMenu.propTypes = {
  children: PropTypes.node
};

export default RobloxDropdownMenu;
