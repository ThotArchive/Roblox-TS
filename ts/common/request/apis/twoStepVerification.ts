import { cryptoUtil } from 'core-roblox-utilities';
import { httpService } from 'core-utilities';
import {
  ChallengeIdAndActionType,
  UserId
} from '../../../react/challenge/twoStepVerification/constants/parameters';
import { Result } from '../../result';
import { toResult } from '../common';
import * as TwoStepVerification from '../types/twoStepVerification';

const { generateSecureAuthIntent } = cryptoUtil;

export const getMetadata = (
  context?: UserId & ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.GetMetadataReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.get(TwoStepVerification.GET_METADATA_CONFIG, context || {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const getUserConfiguration = (
  userId: string,
  challengeParameters?: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.GetUserConfigurationReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.get(
      TwoStepVerification.GET_USER_CONFIGURATION_CONFIG(userId),
      challengeParameters || {}
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const enableEmailTwoStepVerification = async (
  userId: string
): Promise<
  Result<
    TwoStepVerification.EnableEmailTwoStepVerificationReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> => {
  const secureAuthenticationIntent = await generateSecureAuthIntent();

  return toResult(
    httpService.post(TwoStepVerification.ENABLE_EMAIL_TWO_STEP_VERIFICATION_CONFIG(userId), {
      secureAuthenticationIntent
    }),
    TwoStepVerification.TwoStepVerificationError
  );
};

export const sendEmailCode = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.SendEmailCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.SEND_EMAIL_CODE_CONFIG(userId), challengeParameters),
    TwoStepVerification.TwoStepVerificationError
  );

export const verifyEmailCode = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifyEmailCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.VERIFY_EMAIL_CODE_CONFIG(userId), verificationParameters),
    TwoStepVerification.TwoStepVerificationError
  );

export const disableEmailTwoStepVerification = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.DisableEmailTwoStepVerificationReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.DISABLE_EMAIL_TWO_STEP_VERIFICATION_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const enableAuthenticator = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.EnableAuthenticatorReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.ENABLE_AUTHENTICATOR_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const enableVerifyAuthenticator = async (
  userId: string,
  setupToken: string,
  code: string
): Promise<
  Result<
    TwoStepVerification.EnableVerifyAuthenticatorReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> => {
  const secureAuthenticationIntent = await generateSecureAuthIntent();
  return toResult(
    httpService.post(TwoStepVerification.ENABLE_VERIFY_AUTHENTICATOR_CONFIG(userId), {
      setupToken,
      code,
      secureAuthenticationIntent
    }),
    TwoStepVerification.TwoStepVerificationError
  );
};

export const verifyAuthenticatorCode = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifyAuthenticatorCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.VERIFY_AUTHENTICATOR_CODE_CONFIG(userId),
      verificationParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const disableAuthenticator = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.DisableAuthenticatorReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.DISABLE_AUTHENTICATOR_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const verifyRecoveryCode = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifyRecoveryCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.VERIFY_RECOVERY_CODE_CONFIG(userId),
      verificationParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const getRecoveryCodesStatus = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.GetRecoveryCodesStatusReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.get(TwoStepVerification.GET_RECOVERY_CODES_STATUS_CONFIG(userId)),
    TwoStepVerification.TwoStepVerificationError
  );

export const generateRecoveryCodes = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.GenerateRecoveryCodesReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.GENERATE_RECOVERY_CODES_CONFIG(userId), {
      // TODO: Remove the 'password' default; this is a temporary workaround for an
      // incomplete flagging job.
      password: 'password'
    }),
    TwoStepVerification.TwoStepVerificationError
  );

export const enableSmsTwoStepVerification = async (
  userId: string
): Promise<
  Result<
    TwoStepVerification.EnableSmsTwoStepVerificationReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> => {
  const secureAuthenticationIntent = await generateSecureAuthIntent();
  return toResult(
    httpService.post(TwoStepVerification.ENABLE_SMS_TWO_STEP_VERIFICATION_CONFIG(userId), {
      secureAuthenticationIntent
    }),
    TwoStepVerification.TwoStepVerificationError
  );
};

export const sendSmsCode = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.SendSmsCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.SEND_SMS_CODE_CONFIG(userId), challengeParameters),
    TwoStepVerification.TwoStepVerificationError
  );

export const verifySmsCode = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifySmsCodeReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.VERIFY_SMS_CODE_CONFIG(userId), verificationParameters),
    TwoStepVerification.TwoStepVerificationError
  );

export const disableSmsTwoStepVerification = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.DisableSmsTwoStepVerificationReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.DISABLE_SMS_TWO_STEP_VERIFICATION_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const enableSecurityKey = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.EnableSecurityKeyReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> => {
  const additionalProcessingFunction = (
    enableSecurityKeyResult: TwoStepVerification.EnableSecurityKeyReturnType
  ) => {
    return {
      creationOptions: JSON.parse(
        enableSecurityKeyResult.creationOptions as string
      ) as CredentialCreationOptions,
      sessionId: enableSecurityKeyResult.sessionId
    };
  };
  return toResult(
    httpService.post(TwoStepVerification.ENABLE_SECURITY_KEY_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError,
    additionalProcessingFunction
  );
};

export const enableVerifySecurityKey = async (
  userId: string,
  sessionId: string,
  credentialNickname: string,
  attestationResponse: unknown
): Promise<
  Result<
    TwoStepVerification.EnableVerifySecurityKeyReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> => {
  const secureAuthenticationIntent = await generateSecureAuthIntent();

  return toResult(
    httpService.post(TwoStepVerification.ENABLE_VERIFY_SECURITY_KEY_CONFIG(userId), {
      sessionId,
      credentialNickname,
      attestationResponse,
      secureAuthenticationIntent
    }),
    TwoStepVerification.TwoStepVerificationError
  );
};

export const getSecurityKeyOptions = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.GetSecurityKeyOptionsReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.GET_SECURITY_KEY_OPTIONS_CONFIG(userId),
      challengeParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

// For security keys, the TwoStepVerification.Code is the JSON-encoded assertion response from the authenticator.
export const verifySecurityKeyCredential = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifySecurityKeyCredentialReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.VERIFY_SECURITY_KEY_CREDENTIAL_CONFIG(userId),
      verificationParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const deleteSecurityKey = (
  userId: string,
  credentialNicknames: string[]
): Promise<
  Result<
    TwoStepVerification.DeleteSecurityKeyReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.DELETE_SECURITY_KEY_CONFIG(userId), {
      credentialNicknames
    }),
    TwoStepVerification.TwoStepVerificationError
  );

export const listSecurityKey = (
  userId: string
): Promise<
  Result<
    TwoStepVerification.ListSecurityKeyReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.LIST_SECURITY_KEY_CONFIG(userId), {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const getPasskeyOptions = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.GetPasskeyOptionsReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(TwoStepVerification.GET_PASSKEY_OPTIONS_CONFIG(userId), challengeParameters),
    TwoStepVerification.TwoStepVerificationError
  );

// For security keys, the TwoStepVerification.Code is the JSON-encoded assertion response from the authenticator.
export const verifyPasskeyCredential = (
  userId: string,
  verificationParameters: ChallengeIdAndActionType & TwoStepVerification.Code
): Promise<
  Result<
    TwoStepVerification.VerifyPasskeyCredentialReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.VERIFY_PASSKEY_CREDENTIAL_CONFIG(userId),
      verificationParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const getSpendFrictionStatus = (): Promise<
  Result<boolean, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.get(TwoStepVerification.GET_SPEND_FRICTION_STATUS_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const getTradeFrictionStatus = (): Promise<
  Result<boolean, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.get(TwoStepVerification.GET_TRADE_FRICTION_STATUS_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const getResaleFrictionStatus = (): Promise<
  Result<boolean, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.get(TwoStepVerification.GET_RESALE_FRICTION_STATUS_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const generateSpendFrictionChallenge = (): Promise<
  Result<string, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.post(TwoStepVerification.GENERATE_SPEND_FRICTION_CHALLENGE_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const generateTradeFrictionChallenge = (): Promise<
  Result<string, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.post(TwoStepVerification.GENERATE_TRADE_FRICTION_CHALLENGE_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const generateResaleFrictionChallenge = (): Promise<
  Result<string, TwoStepVerification.TwoStepVerificationError | null>
> =>
  toResult(
    httpService.post(TwoStepVerification.GENERATE_RESALE_FRICTION_CHALLENGE_CONFIG, {}),
    TwoStepVerification.TwoStepVerificationError
  );

export const redeemSpendFrictionChallenge = (
  challengeToken: string,
  verificationToken: string
): Promise<Result<boolean, TwoStepVerification.TwoStepVerificationError | null>> =>
  toResult(
    httpService.post(TwoStepVerification.REDEEM_SPEND_FRICTION_CHALLENGE_CONFIG, {
      challengeToken,
      verificationToken
    }),
    TwoStepVerification.TwoStepVerificationError
  );

export const redeemTradeFrictionChallenge = (
  challengeToken: string,
  verificationToken: string
): Promise<Result<boolean, TwoStepVerification.TwoStepVerificationError | null>> =>
  toResult(
    httpService.post(TwoStepVerification.REDEEM_TRADE_FRICTION_CHALLENGE_CONFIG, {
      challengeToken,
      verificationToken
    }),
    TwoStepVerification.TwoStepVerificationError
  );

export const redeemResaleFrictionChallenge = (
  challengeToken: string,
  verificationToken: string
): Promise<Result<boolean, TwoStepVerification.TwoStepVerificationError | null>> =>
  toResult(
    httpService.post(TwoStepVerification.REDEEM_RESALE_FRICTION_CHALLENGE_CONFIG, {
      challengeToken,
      verificationToken
    }),
    TwoStepVerification.TwoStepVerificationError
  );

export const retryCrossDevice = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.RetryCrossDeviceReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.RETRY_CROSS_DEVICE_PROMPT_CONFIG(userId),
      challengeParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const verifyCrossDevice = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.VerifyCrossDeviceReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.VERIFY_CROSS_DEVICE_PROMPT_CONFIG(userId),
      challengeParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );

export const retractCrossDevice = (
  userId: string,
  challengeParameters: ChallengeIdAndActionType
): Promise<
  Result<
    TwoStepVerification.RetractCrossDeviceReturnType,
    TwoStepVerification.TwoStepVerificationError | null
  >
> =>
  toResult(
    httpService.post(
      TwoStepVerification.RETRACT_CROSS_DEVICE_PROMPT_CONFIG(userId),
      challengeParameters
    ),
    TwoStepVerification.TwoStepVerificationError
  );
