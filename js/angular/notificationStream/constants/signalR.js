import notificationStreamModule from '../notificationStreamModule';

const signalR = {
  notifications: {
    NotificationStream: 'NotificationStream'
  },
  types: {
    NewNotification: 'NewNotification',
    NotificationsRead: 'NotificationsRead',
    NotificationMarkedInteracted: 'NotificationMarkedInteracted',
    NotificationRevoked: 'NotificationRevoked'
  }
};

notificationStreamModule.constant('signalR', signalR);

export default signalR;
