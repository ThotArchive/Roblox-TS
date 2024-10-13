import React, { useRef } from 'react';
import { Popover } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import NotificationStreamIcon from '../containers/NotificationStreamIcon';
import NotificationStreamBase from '../containers/NotificationStreamBase';
import events from '../constants/notificationsEventStreamConstants';

function NotificationStreamPopover() {
  const ref = useRef();

  return (
    <li
      id='navbar-stream'
      ref={ref}
      className='navbar-icon-item navbar-stream notification-margins'>
      <Popover
        id='notification-stream-popover'
        trigger='click'
        placement='bottom'
        closeOnClick={false}
        button={
          <button type='button' className='btn-uiblox-common-common-notification-bell-md'>
            <NotificationStreamIcon />
          </button>
        }
        container={ref.current}
        onExit={() => {
          window.dispatchEvent(new Event('Roblox.NotificationStream.StreamClosed'));
          eventStreamService.sendEventWithTarget(
            events.onExit.name,
            events.onExit.context,
            events.onExit.additionalProperties
          );
        }}
        role='menu'>
        <NotificationStreamBase />
      </Popover>
    </li>
  );
}

NotificationStreamPopover.propTypes = {};

export default NotificationStreamPopover;
