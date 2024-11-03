import notificationStreamModule from '../notificationStreamModule';

const notificationStreamConstants = {
  experimentionLayer: 'Notifications.StreamNotificationUX',
  recentGameUpdateRetrievedEventName: 'nsRecentGameUpdateRetrieved',
  acceptFriendGroupCount: 'nsAcceptFriendGroupCount',
  streamNotificationsLayer: 'Notifications.StreamNotificationUX'
};

notificationStreamModule.constant('notificationStreamConstants', notificationStreamConstants);

export default notificationStreamConstants;
