import * as ProofOfWork from '../../../../common/request/types/proofOfWork';
import { PROOF_OF_WORK_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof PROOF_OF_WORK_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Description: {
      VerificationError: translate('Description.VerificationError'),
      VerificationSuccess: translate('Description.VerificationSuccess'),
      VerifyingYouAreNotBot: translate('Description.VerifyingYouAreNotBot')
    }
  } as const);

export type ProofOfWorkResources = ReturnType<typeof getResources>;

export const mapProofOfWorkErrorToChallengeErrorCode = (
  error: ProofOfWork.ProofOfWorkError | null
): ErrorCode => {
  switch (error) {
    case ProofOfWork.ProofOfWorkError.SESSION_INACTIVE:
      return ErrorCode.SESSION_INVALID;
    default:
      return ErrorCode.UNKNOWN;
  }
};
