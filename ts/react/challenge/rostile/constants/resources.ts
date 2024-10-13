import * as Rostile from '../../../../common/request/types/rostile';
import { ROSTILE_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof ROSTILE_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Description: {
      VerificationError: translate('Description.VerificationError'),
      VerificationSuccess: translate('Description.VerificationSuccess'),
      VerificationPrompt: translate('Description.VerificationPrompt'),
      VerificationHeader: translate('Description.VerificationHeader'),
      VerificationErrorHeader: translate('Description.VerificationErrorHeader'),
      ImAHuman: translate('Description.ImAHuman'),
      Ok: translate('Description.Ok')
    }
  } as const);

export type RostileResources = ReturnType<typeof getResources>;

export const mapRostileErrorToChallengeErrorCode = (
  error: Rostile.RostileError | null
): ErrorCode => {
  switch (error) {
    case Rostile.RostileError.INVALID_SESSION:
      return ErrorCode.INVALID_SESSION;
    default:
      return ErrorCode.UNKNOWN;
  }
};
