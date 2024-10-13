import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as MyAccount from '../types/myAccount';

// eslint-disable-next-line import/prefer-default-export
export const getMySettingsInfo = (): Promise<
  Result<MyAccount.GetMySettingsInfoReturnType, MyAccount.GetMySettingsInfoError | null>
> =>
  toResult(
    httpService.get(MyAccount.GET_MY_SETTINGS_INFO_CONFIG, {}),
    MyAccount.GetMySettingsInfoError
  );
