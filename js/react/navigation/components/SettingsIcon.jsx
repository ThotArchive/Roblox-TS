import React from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';

function SettingsIcon({ accountNotificationCount }) {
  const notificationClasses = ClassNames('notification-red notification nav-setting-highlight', {
    hidden: accountNotificationCount === 0
  });
  return (
    <span id='settings-icon' className='nav-settings-icon rbx-menu-item'>
      <span className='icon-nav-settings roblox-popover-close' id='nav-settings' />
      <span className={notificationClasses}>{accountNotificationCount}</span>
    </span>
  );
}

SettingsIcon.defaultProps = {
  accountNotificationCount: 0
};
SettingsIcon.propTypes = {
  accountNotificationCount: PropTypes.number
};
export default SettingsIcon;
