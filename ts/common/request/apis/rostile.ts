/* eslint-disable import/prefer-default-export */
import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Rostile from '../types/rostile';

export const verifyPuzzle = async (
  challengeId: string,
  solution: Rostile.Solution
): Promise<Result<Rostile.VerifyPuzzleReturnType, Rostile.RostileError | null>> =>
  toResult(
    httpService.post(Rostile.VERIFY_PUZZLE_CONFIG, {
      challengeId,
      solution
    }),
    Rostile.RostileError
  );
