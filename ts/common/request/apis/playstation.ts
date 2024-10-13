import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Playstation from '../types/playstation';

export const getPlaystationConnection = (): Promise<
  Result<boolean, Playstation.PlaystationError | null>
> =>
  toResult(
    httpService.get(Playstation.GET_PLAYSTATION_CONNECTION_CONFIG, {}),
    Playstation.PlaystationError
  );

export const disconnectPlaystation = (): Promise<
  Result<Playstation.disconnectPlaystationReturnType, Playstation.PlaystationError | null>
> =>
  toResult(
    httpService.post(Playstation.DISCONNECT_PLAYSTATION_CONFIG, {}),
    Playstation.PlaystationError
  );
