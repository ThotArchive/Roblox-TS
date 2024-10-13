import * as Otp from '../../../../common/request/types/otp';
import * as Reauthentication from '../../../../common/request/types/reauthentication';
import * as Fido2 from '../../../../common/request/types/fido2';
import { REAUTHENTICATION_LANGUAGE_RESOURCES } from '../app.config';
import { ErrorCode } from '../interface';
/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof REAUTHENTICATION_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      ForgotYourPassword: (linkStart: string, linkEnd: string) =>
        translate('Action.ForgotYourPassword', {
          linkStart,
          linkEnd
        }),
      PleaseTryAgain: translate('Action.PleaseTryAgain'),
      Verify: translate('Action.Verify'),
      CodeSent: translate('Action.CodeSent'),
      ResendCode: translate('Action.ResendCode'),
      ChangeVerificationMethod: translate('Action.ChangeVerificationMethod'),
      TryAlternativeMethod: translate('Action.TryAlternativeMethod')
    },
    Description: {
      EnterYourPassword: translate('Description.EnterYourPassword'),
      EnterYourOtpCode: translate('Description.EnterYourOtpCode', { lineBreak: '\n' })
    },
    Header: {
      PasskeyVerification: translate('Header.PasskeyVerification'),
      PasswordVerification: translate('Header.PasswordVerification'),
      OtpVerification: translate('Header.OtpVerification'),
      VerificationMethodSelection: translate('Header.VerificationMethodSelection')
    },
    Label: {
      Passkey: translate('Label.Passkey'),
      PasskeyDirections: translate('Label.PasskeyDirections'),
      Password: translate('Label.Password'),
      OneTimeCode: translate('Label.OneTimeCode'),
      VerifyWithPasskey: translate('Label.VerifyWithPasskey'),
      YourPassword: translate('Label.YourPassword'),
      YourOtpCode: translate('Label.YourOtpCode'),
      ChooseVerificationMethod: translate('Label.ChooseVerificationMethod')
    },
    Message: {
      Error: {
        Default: translate('Message.Error.Default'),
        NoCredentialsFound: translate('Message.Error.NoCredentialsFound'),
        PasswordIncorrect: translate('Message.Error.PasswordIncorrect'),
        OtpCodeIncorrect: translate('Message.Error.OtpCodeIncorrect'),
        OtpCodeExpired: translate('Message.Error.OtpCodeExpired'),
        OtpRedeemFailure: translate('Message.Error.OtpRedeemFailure'),
        OtpCodeThrottled: translate('Message.Error.OtpCodeThrottled')
      }
    }
  } as const);

export type ReauthenticationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: ReauthenticationResources,
  errorCode: ErrorCode
): string => {
  switch (errorCode) {
    case ErrorCode.OTP_CODE_EXPIRED:
      return resources.Message.Error.OtpCodeExpired;
    default:
      return resources.Message.Error.Default;
  }
};

export const mapReauthenticationErrorToResource = (
  resources: ReauthenticationResources,
  error: Reauthentication.ReauthenticationError | null
): string => {
  switch (error) {
    case Reauthentication.ReauthenticationError.PASSWORD_INCORRECT:
      return resources.Message.Error.PasswordIncorrect;
    case Reauthentication.ReauthenticationError.OTP_EMAIL_REDEEM_FAILURE:
      return resources.Message.Error.OtpRedeemFailure;
    default:
      return resources.Message.Error.Default;
  }
};

export const mapFido2ErrorToResource = (
  resources: ReauthenticationResources,
  error: Fido2.Fido2Error | null
): string => {
  switch (error) {
    case Fido2.Fido2Error.UNKNOWN:
      return `${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`;
    case Fido2.Fido2Error.NO_CREDENTIALS_FOUND:
      return resources.Message.Error.NoCredentialsFound;
    default:
      return `${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`;
  }
};

export const mapReauthenticationOtpErrorToResource = (
  resources: ReauthenticationResources,
  error: Otp.OtpError | null
): string => {
  switch (error) {
    case Otp.OtpError.INVALID_CODE:
      return resources.Message.Error.OtpCodeIncorrect;
    case Otp.OtpError.TOO_MANY_REQUESTS:
      return resources.Message.Error.OtpCodeThrottled;
    default:
      return resources.Message.Error.Default;
  }
};

export const mapReauthenticationErrorToChallengeErrorCode = (
  error: Reauthentication.ReauthenticationError | null
): ErrorCode => {
  switch (error) {
    default:
      return ErrorCode.UNKNOWN;
  }
};

export const mapOtpErrorToChallengeErrorCode = (error: Otp.OtpError | null): ErrorCode => {
  switch (error) {
    case Otp.OtpError.CODE_EXPIRED:
    case Otp.OtpError.INVALID_SESSION_TOKEN:
      return ErrorCode.OTP_CODE_EXPIRED;
    default:
      return ErrorCode.UNKNOWN;
  }
};
