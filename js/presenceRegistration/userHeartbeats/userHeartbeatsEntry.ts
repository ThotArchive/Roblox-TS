import { CurrentUser } from 'Roblox';
import UserHeartbeatScheduler from './userHeartbeatScheduler';
import guacService from './services/guacService';

import { activeEvents, inactiveEvents } from './constants/constants';

export default async function init(): Promise<void> {
  const config = await guacService.loadGuacConfig();
  if (
    config.isEnabled &&
    CurrentUser?.userId &&
    parseInt(CurrentUser.userId, 10) % 100 < config.rolloutPercentage
  ) {
    const userHeartbeatScheduler = new UserHeartbeatScheduler(config.intervalTimeMs);

    activeEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        userHeartbeatScheduler.onActiveEvent().catch(console.error);
      });
    });

    inactiveEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        userHeartbeatScheduler.onInactiveEvent();
      });
    });

    await userHeartbeatScheduler.start();
  }
}
