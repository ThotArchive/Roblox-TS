import { UserPresence } from '@rbx/unified-logging';

export const getUserPresenceType = (
  isOnline: boolean | undefined,
  isInGame: boolean | undefined,
  lastLocation: string | undefined
): UserPresence => {
  if (isInGame) {
    return UserPresence.InGame;
  }

  if (isOnline && lastLocation === 'Studio') {
    return UserPresence.InStudio;
  }

  if (isOnline) {
    return UserPresence.Online;
  }

  return UserPresence.Offline;
};

export default getUserPresenceType;
