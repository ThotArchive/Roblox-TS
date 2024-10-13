import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as AccountPin from '../types/accountPin';

export const getState = (): Promise<
  Result<AccountPin.GetStateReturnType, AccountPin.AccountPinError | null>
> => toResult(httpService.get(AccountPin.GET_STATE_CONFIG), AccountPin.AccountPinError);

export const unlock = (
  pin: string
): Promise<Result<AccountPin.UnlockReturnType, AccountPin.AccountPinError | null>> =>
  toResult(httpService.post(AccountPin.UNLOCK_CONFIG, { pin }), AccountPin.AccountPinError);

export const lock = (): Promise<
  Result<AccountPin.LockReturnType, AccountPin.AccountPinError | null>
> => toResult(httpService.post(AccountPin.LOCK_CONFIG), AccountPin.AccountPinError);
