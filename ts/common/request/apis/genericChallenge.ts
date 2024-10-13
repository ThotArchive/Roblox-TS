import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as GenericChallenge from '../types/genericChallenge';

// eslint-disable-next-line import/prefer-default-export
export const continueChallenge = async (
  challengeId: string,
  challengeType: string,
  challengeMetadata: string
): Promise<
  Result<
    GenericChallenge.ContinueChallengeReturnType,
    GenericChallenge.GenericChallengeError | null
  >
> =>
  toResult(
    httpService.post(GenericChallenge.CONTINUE_CHALLENGE_CONFIG, {
      challengeId,
      challengeType,
      challengeMetadata
    }),
    GenericChallenge.GenericChallengeError
  );
