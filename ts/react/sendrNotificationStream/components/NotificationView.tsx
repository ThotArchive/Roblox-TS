import {
  NotificationTemplateProps,
  NotificationLayoutType
} from '../types/NotificationTemplateTypes';

import LegacyNotificationTemplate from './templates/LegacyNotificationTemplate';

export const NotificationView = (notificationProps: NotificationTemplateProps): JSX.Element => {
  let currentTemplate;
  switch (notificationProps.currentState.layoutKey) {
    case NotificationLayoutType.Default:
    default:
      currentTemplate = LegacyNotificationTemplate;
      break;
  }

  const handleActions = notificationProps.isReadOnly ? undefined : notificationProps.handleActions;
  return currentTemplate({ ...notificationProps, handleActions });
};

export default NotificationView;
