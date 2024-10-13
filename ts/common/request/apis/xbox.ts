import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Xbox from '../types/xbox';

export const getXboxConnection = (): Promise<
  Result<Xbox.getXboxConnectionReturnType, Xbox.XboxError | null>
> => toResult(httpService.get(Xbox.GET_XBOX_CONNECTION_CONFIG, {}), Xbox.XboxError);

export const disconnectXbox = (): Promise<
  Result<Xbox.disconnectXboxReturnType, Xbox.XboxError | null>
> => toResult(httpService.post(Xbox.DISCONNECT_XBOX_CONFIG, {}), Xbox.XboxError);
