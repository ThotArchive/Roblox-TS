import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as PrivateAccessToken from '../types/privateAccessToken';

// eslint-disable-next-line import/prefer-default-export
export const getPatToken = async (
  challengeId: string
): Promise<
  Result<
    PrivateAccessToken.GetPatTokenReturnType,
    PrivateAccessToken.PrivateAccessTokenError | null
  >
> =>
  toResult(
    httpService.post(PrivateAccessToken.GET_PAT_TOKEN_CONFIG, { challengeId }),
    PrivateAccessToken.PrivateAccessTokenError
  );
