import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropdown from 'react-bootstrap/lib/Dropdown';

import RobloxDropdownItem from './RobloxDropdownItem';
import RobloxDropdownMenu from './RobloxDropdownMenu';

function RobloxDropdown({ id, currSelectionLabel, icon, children, className, ...otherProps }) {
  const iconClasses = classNames('dropdown-icon', icon);
  const dropdownClasses = classNames(className, 'input-group-btn');
  return (
    <Dropdown {...otherProps} id={id} className={dropdownClasses}>
      <Dropdown.Toggle className='input-dropdown-btn' noCaret>
        {icon && <span className={iconClasses} />}
        <span className='rbx-selection-label'>{currSelectionLabel}</span>
        <span className='icon-down-16x16' />
      </Dropdown.Toggle>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}

RobloxDropdown.defaultProps = {
  className: null,
  currSelectionLabel: null,
  icon: null,
  children: null
};

RobloxDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  currSelectionLabel: PropTypes.node,
  icon: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

RobloxDropdown.Item = RobloxDropdownItem;
RobloxDropdown.Menu = RobloxDropdownMenu;

export default RobloxDropdown;
