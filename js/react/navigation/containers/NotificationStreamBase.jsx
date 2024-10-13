import React from 'react';
import angular from 'angular';
import ClassNames from 'classnames';
import navigationUtil from '../util/navigationUtil';

class NotificationStreamBase extends React.Component {
  componentDidMount() {
    try {
      angular.module('notificationStream');
      angular.bootstrap(this.container, ['notificationStream']);
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const themeFontClass = navigationUtil.getThemeClass();
    const streamClass = ClassNames('notification-stream-base', themeFontClass);
    return (
      <div
        ref={c => {
          this.container = c;
        }}
        className={streamClass}
        notification-stream-base-view='true'
      />
    );
  }
}

export default NotificationStreamBase;
