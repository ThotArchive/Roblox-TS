import React from 'react';
import angular from 'angular';

class NotificationStreamIcon extends React.Component {
  componentDidMount() {
    try {
      angular.module('notificationStreamIcon');
      angular.bootstrap(this.container, ['notificationStreamIcon']);
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <span
        ref={c => {
          this.container = c;
        }}
        className='nav-robux-icon rbx-menu-item'>
        <span id='notification-stream-icon-container' notification-stream-indicator='true' />
      </span>
    );
  }
}

export default NotificationStreamIcon;
