import * as ProofOfSpace from '../../../../common/request/types/proofOfSpace';
import { PROOF_OF_SPACE_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof PROOF_OF_SPACE_LANGUAGE_RESOURCES[number],
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

export type ProofOfSpaceResources = ReturnType<typeof getResources>;

export const mapProofOfSpaceErrorToChallengeErrorCode = (
  error: ProofOfSpace.ProofOfSpaceError | null
): ErrorCode => {
  switch (error) {
    case ProofOfSpace.ProofOfSpaceError.INVALID_SESSION:
      return ErrorCode.SESSION_INVALID;
    default:
      return ErrorCode.UNKNOWN;
  }
};
