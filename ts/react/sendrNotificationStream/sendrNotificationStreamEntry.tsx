import Roblox from 'Roblox';

import '../../../css/sendrNotificationStream/sendrNotificationStream.scss';
import {
  renderSendrNotification,
  renderSendrModalContainer
} from './utils/notificationReactMountUtility';

Object.assign(Roblox, {
  NotificationStreamService: {
    renderSendrNotification,
    renderSendrModalContainer
  }
});
