import { CAPTCHA_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof CAPTCHA_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      PleaseTryAgain: translate('Action.PleaseTryAgain'),
      Reload: translate('Action.Reload')
    },
    Description: {
      VerifyingYouAreNotBot: translate('Description.VerifyingYouAreNotBot')
    },
    Message: {
      Error: {
        Default: translate('Message.Error.Default')
      }
    }
  } as const);

export type CaptchaResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: CaptchaResources,
  errorCode: ErrorCode
): string => {
  switch (errorCode) {
    default:
      return resources.Message.Error.Default;
  }
};
