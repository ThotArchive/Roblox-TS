import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as ProofOfWork from '../types/proofOfWork';

export const getPuzzle = (
  sessionID: string
): Promise<Result<ProofOfWork.GetPuzzleReturnType, ProofOfWork.ProofOfWorkError | null>> =>
  toResult(
    httpService.get(ProofOfWork.GET_PUZZLE_CONFIG, { sessionID }),
    ProofOfWork.ProofOfWorkError
  );

export const verifyPuzzle = async (
  sessionID: string,
  solution: string
): Promise<Result<ProofOfWork.VerifyPuzzleReturnType, ProofOfWork.ProofOfWorkError | null>> =>
  toResult(
    httpService.post(ProofOfWork.VERIFY_PUZZLE_CONFIG, {
      sessionID,
      solution
    }),
    ProofOfWork.ProofOfWorkError
  );
