import * as PrivateAccessToken from '../../../../common/request/types/privateAccessToken';
import { PRIVATE_ACCESS_TOKEN_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof PRIVATE_ACCESS_TOKEN_LANGUAGE_RESOURCES[number],
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

export type PrivateAccessTokenResources = ReturnType<typeof getResources>;

export const mapPrivateAccessTokenErrorToChallengeErrorCode = (
  error: PrivateAccessToken.PrivateAccessTokenError | null
): ErrorCode => {
  switch (error) {
    default:
      return ErrorCode.UNKNOWN;
  }
};
