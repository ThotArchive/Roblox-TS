import { localStorageService } from 'core-roblox-utilities';
import { CurrentUser } from 'Roblox';
import RobuxBadgeType from '../constants/robuxBadgeConstants';

export const mapRobuxBadgeTypeToLocalStorageKey = (robuxBadgeType: string): string => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      return `prevLocalVirtualItemStartTimeSeconds${CurrentUser.userId}`;
    case RobuxBadgeType.UPDATE:
      return 'hasSeenRobuxUpdate';
    default:
      return '';
  }
};

export const mapRobuxBadgeTypeToStr = (robuxBadgeType: string): string => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      return 'Labels.NewItem';
    case RobuxBadgeType.UPDATE:
      return 'Labels.NewUpdate';
    default:
      return '';
  }
};

export const setRobuxBadgeLocalStorage = (robuxBadgeType: string): void => {
  const localStorageKey = mapRobuxBadgeTypeToLocalStorageKey(robuxBadgeType);
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      // Set local storage to hide robux badge for current virtual item when badge is acknowledged.
      localStorageService.setLocalStorage(localStorageKey, Math.floor(Date.now() / 1000));
      break;
    case RobuxBadgeType.UPDATE:
      localStorageService.setLocalStorage(localStorageKey, 'true');
      break;
    default:
  }
};

export const getRobuxBadgeLocalStorage = (robuxBadgeType: string): any => {
  const localStorageKey = mapRobuxBadgeTypeToLocalStorageKey(robuxBadgeType);
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return localStorageService.getLocalStorage(localStorageKey);
    case RobuxBadgeType.UPDATE:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return localStorageService.getLocalStorage(localStorageKey);
    default:
      return '';
  }
};
