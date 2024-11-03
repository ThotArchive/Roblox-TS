import classNames from 'classnames';
import React, { useState } from 'react';
import {
  NotificationData,
  SendrNotificationsBundleProps
} from '../types/NotificationTemplateTypes';
import SendrNotification from './SendrNotification';
import { useNotificationLocalization } from '../context/NotificationsLocalization';
import { sendEventStreamEvent } from '../services/NotificationStreamService';
import eventConstants from '../constants/eventConstants';

export const SendrNotificationsBundle = ({
  notificationsBundle
}: SendrNotificationsBundleProps): JSX.Element => {
  const translate = useNotificationLocalization();

  const [isBundleOpen, setIsBundleOpen] = useState(false);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);
  const [notifications, setNotifications] = useState(notificationsBundle.notifications);

  const iconSize = '-16x16';
  const buttonZIndex = 2;

  const handleNotificationBundleClickEvent = (
    eventName: string,
    bundleKey: string,
    bundleId: string,
    totalNotifications: number,
    notificationIds?: Array<string>,
    clientEventsPayload?: Record<string, string>
  ) => {
    sendEventStreamEvent(eventName, 'click', {
      ...clientEventsPayload,
      bundleKey,
      bundleId,
      totalNotifications: totalNotifications.toString(),
      notificationIds: `[${notificationIds?.toString() ?? ''}]`
    });
  };

  const handleNotificationBundleViewEvent = (
    eventName: string,
    notificationId: string,
    notificationType: string,
    bundlePosition: number,
    bundleKey?: string,
    bundleId?: string,
    clientEventsPayload?: Record<string, string>
  ) => {
    sendEventStreamEvent(eventName, 'seen', {
      ...clientEventsPayload,
      notificationId,
      sendrVersion: '1.0',
      notificationType,
      bundleKey: bundleKey ?? '',
      bundleId: bundleId ?? '',
      bundlePosition: bundlePosition.toString()
    });
  };

  const toggleOpen = () => {
    // note that the boolean logic is flipped here because setIsBundleOpen is asynchronous and
    // we cannot rely on it to finish before accessing its updated value. therefore, we must update its
    // value after firing the events
    if (!isBundleOpen) {
      notificationsBundle.notifications.forEach((notification, index) => {
        handleNotificationBundleViewEvent(
          eventConstants.NotificationViewedEvent,
          notification.id,
          notification.content.notificationType,
          index,
          notificationsBundle.bundleKey,
          notificationsBundle.bundleId
        );
      });
    }
    handleNotificationBundleClickEvent(
      isBundleOpen
        ? eventConstants.NotificationBundleClosedEvent
        : eventConstants.NotificationBundleOpenedEvent,
      notificationsBundle.bundleKey ?? '',
      notificationsBundle.bundleId ?? '',
      notificationsBundle.notifications.length,
      notificationsBundle.notifications.map(x => x.id)
    );
    setIsBundleOpen(!isBundleOpen);
    if (!isAnimationEnabled) {
      setIsAnimationEnabled(true);
    }
  };

  const handleBundleDismiss = (dismissedIndex: number) => {
    setTimeout(() => {
      setNotifications(notifications.filter((_, index) => index !== dismissedIndex));
    }, 800);
  };

  const bundleClassName = classNames({
    'notification-bundle': true,
    open: notifications.length > 1 && isBundleOpen,
    closed: notifications.length > 1 && !isBundleOpen,
    'multiple-shadows': notifications.length > 2,
    'single-shadow': notifications.length === 2,
    'animation-enabled': isAnimationEnabled
  });

  const createNotificationData = (notification: NotificationData, index: number) => {
    return {
      ...notification,
      isReadOnly: !isBundleOpen,
      bundleIndex: index,
      bundleId: notificationsBundle.bundleId,
      handleBundleDismiss
    };
  };

  return (
    <div className={bundleClassName}>
      {notifications.length > 1 && (
        <button
          className={`bundle-button ${isBundleOpen ? 'open' : 'closed'}`}
          type='button'
          style={{ zIndex: buttonZIndex }}
          onClick={toggleOpen}>
          <span className='bundle-button-label'>
            {isBundleOpen
              ? translate('Bundle.ShowLess')
              : translate('Bundle.ShowMoreV2', {
                  notificationCount: notifications.length - 1 > 0 ? notifications.length - 1 : ''
                })}
          </span>
          <span className={`${isBundleOpen ? `icon-up${iconSize}` : `icon-down${iconSize}`}`} />
        </button>
      )}
      {!isBundleOpen && (
        <button
          type='button'
          aria-label={translate('Bundle.ExpandNotificationBundle')}
          onClick={toggleOpen}
          className='bundle-wrapper-button'
        />
      )}
      {notifications.map((notification, index) => (
        <SendrNotification
          key={notification.id}
          notificationData={createNotificationData(notification, index)}
        />
      ))}
    </div>
  );
};

export default SendrNotificationsBundle;
