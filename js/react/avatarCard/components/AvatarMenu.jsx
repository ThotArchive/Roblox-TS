import React from 'react';
import PropTypes from 'prop-types';
import Popover from '../../popover/components/Popover';
import AvatarMenuItem from './AvatarMenuItem';
import IconButton from '../../button/components/IconButton';

const AvatarMenu = ({ children }) => {
  return (
    <div className='avatar-card-menu'>
      <Popover
        id='avatar-card-dropdown-menu'
        button={<IconButton iconName='more' size={IconButton.sizes.small} />}
        trigger='click'
        placement='bottom'>
        <ul className='dropdown-menu' role='menu'>
          {children}
        </ul>
      </Popover>
    </div>
  );
};

AvatarMenu.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(AvatarMenuItem),
    PropTypes.objectOf(AvatarMenuItem)
  ]).isRequired
};

export default AvatarMenu;
