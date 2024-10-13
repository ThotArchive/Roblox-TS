import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as UniversalAppConfiguration from '../types/universalAppConfiguration';

// eslint-disable-next-line import/prefer-default-export
export const getSettingsUiPolicy = async (): Promise<
  Result<
    UniversalAppConfiguration.GetSettingsUIPolicyReturnType,
    UniversalAppConfiguration.GetSettingsUIPolicyError | null
  >
> =>
  toResult(
    httpService.get(UniversalAppConfiguration.GET_SETTINGS_UI_POLICY_CONFIG, {}),
    UniversalAppConfiguration.GetSettingsUIPolicyError
  );
