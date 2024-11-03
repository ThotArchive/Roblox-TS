import { EMAIL_VERIFICATION_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof EMAIL_VERIFICATION_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Header: {
      VerifyYourAccount: translate('Header.VerifyYourAccount'),
      EnterCode: translate('Header.EnterCode'),
      ConfirmAbandon: translate('Header.ConfirmAbandon')
    },
    Description: {
      SuspiciousActivityEmailVerification: translate(
        'Description.SuspiciousActivityEmailVerificationV1'
      ),
      EnterCode: translate('Description.EnterCode'),
      ConfirmAbandon: translate('Description.ConfirmAbandon')
    },
    Message: {
      Error: {
        Default: translate('Message.Error.Default')
      }
    },
    Label: {
      ConfirmAbandon: translate('Label.ConfirmAbandon'),
      RejectAbandon: translate('Label.RejectAbandon')
    }
  } as const);

export type EmailVerificationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: EmailVerificationResources,
  errorCode: ErrorCode
): string => {
  switch (errorCode) {
    default:
      return resources.Message.Error.Default;
  }
};
