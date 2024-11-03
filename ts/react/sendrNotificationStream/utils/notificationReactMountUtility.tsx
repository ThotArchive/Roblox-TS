import React from 'react';
import { render } from 'react-dom';
import { NotificationsBundle, NotificationData } from '../types/NotificationTemplateTypes';

import SendrNotification from '../components/SendrNotification';
import SendrNotificationsBundle from '../components/SendrNotificationsBundle';
import NotificationStreamModalContainer from '../containers/NotificationStreamModalContainer';
import { NotificationLocalizationProvider } from '../context/NotificationsLocalization';

export const renderSendrNotification = (entry: Element): void => {
  const notificationDataJSON: string | null = entry.getAttribute('notification-data');

  if (!notificationDataJSON) {
    return;
  }
  if (notificationDataJSON === '{{notification}}') {
    // Notification data has not been populated from angular yet
    window.requestAnimationFrame(() => {
      renderSendrNotification(entry);
    });
    return;
  }

  const notificationData = JSON.parse(notificationDataJSON) as
    | NotificationsBundle
    | NotificationData;

  if (notificationData.notificationSourceType === 'SendrBundle') {
    const notificationsBundle = notificationData as NotificationsBundle;
    if (notificationsBundle.notifications?.length > 1) {
      // render multipled bundled notifications together
      render(
        <NotificationLocalizationProvider>
          <SendrNotificationsBundle notificationsBundle={notificationsBundle} />
        </NotificationLocalizationProvider>,
        entry
      );
    } else {
      // if there's only one notification in a bundle, render it as a single notification
      render(<SendrNotification notificationData={notificationsBundle.notifications[0]} />, entry);
    }
  } else {
    render(<SendrNotification notificationData={notificationData as NotificationData} />, entry);
  }
};

export const renderSendrModalContainer = (entry: Element): void => {
  render(<NotificationStreamModalContainer />, entry);
};
