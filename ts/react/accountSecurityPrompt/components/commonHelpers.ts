/* eslint-disable import/prefer-default-export */
import { DAYS_REMAINING_TO_FORCE_RESET_DEFAULT } from '../app.config';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the number of days until the given force reset timestamp (expressed
 * as an epoch milliseconds string).
 */
export const getDaysRemainingToForceReset = (forceResetTimestamp: string): number => {
  const epochMilliseconds = parseInt(forceResetTimestamp, 10);
  if (Number.isNaN(epochMilliseconds) || !Number.isSafeInteger(epochMilliseconds)) {
    return DAYS_REMAINING_TO_FORCE_RESET_DEFAULT;
  }

  const millisecondsRemaining = Math.max(0, epochMilliseconds - Date.now());
  return Math.floor(millisecondsRemaining / MILLISECONDS_PER_DAY);
};
