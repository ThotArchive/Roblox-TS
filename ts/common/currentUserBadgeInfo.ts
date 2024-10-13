import { CurrentUser } from 'Roblox';

export const currentUserHasVerifiedBadge = (): boolean => {
  return CurrentUser.hasVerifiedBadge || false;
};

export const currentUserHasPremium = (): boolean => {
  return CurrentUser.isPremiumUser || false;
};

export const getCurrentUserId = (): string => {
  return CurrentUser.userId;
};
