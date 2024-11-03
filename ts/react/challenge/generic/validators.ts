/* eslint-disable import/prefer-default-export */
import * as z from 'zod';
import * as Captcha from '../captcha/interface';
import * as Rostile from '../rostile/interface';
import { ReauthenticationType } from '../reauthentication/interface';
import { ActionType } from '../twoStepVerification/interface';
import { ChallengeType } from './interface';
import * as Metadata from './interface/metadata/interface';
import * as ProofOfSpace from '../proofOfSpace/interface';
import { FrictionContext } from './interface/metadata/challenge';

const SharedChallengeMetadataValidator = z.object({
  sharedParameters: z
    .object({
      shouldAnalyze: z.boolean().optional(),
      useContinueMode: z.boolean().optional(),
      genericChallengeId: z.string().optional()
    })
    .optional()
});

const TwoStepVerificationChallengeMetadataValidator = z
  .object({
    userId: z.string(),
    challengeId: z.string(),
    shouldShowRememberDeviceCheckbox: z.boolean(),
    actionType: z.nativeEnum(ActionType)
  })
  .and(SharedChallengeMetadataValidator);

const CaptchaChallengeMetadataValidator = z
  .object({
    actionType: z.nativeEnum(Captcha.ActionType),
    dataExchangeBlob: z.string(),
    unifiedCaptchaId: z.string()
  })
  .and(SharedChallengeMetadataValidator);

const SecurityQuestionsChallengeMetadataValidator = z
  .object({
    userId: z.string(),
    sessionId: z.string()
  })
  .and(SharedChallengeMetadataValidator);

const ReauthenticationValidator = z
  .object({
    defaultType: z.nativeEnum(ReauthenticationType),
    availableTypes: z.array(z.nativeEnum(ReauthenticationType)),
    defaultTypeMetadata: z
      .object({
        passkeyAuthOptions: z.string().optional(),
        passkeySessionId: z.string().optional()
      })
      .nullable()
  })
  .and(SharedChallengeMetadataValidator);

const ForceAuthenticatorValidator = z.object({}).and(SharedChallengeMetadataValidator);

const ForceTwoStepVerificationValidator = z.object({}).and(SharedChallengeMetadataValidator);

const ProofOfWorkValidator = z
  .object({
    sessionId: z.string()
  })
  .and(SharedChallengeMetadataValidator);

const RostileValidator = z
  .object({
    challengeId: z.string(),
    puzzleType: z.nativeEnum(Rostile.PuzzleType)
  })
  .and(SharedChallengeMetadataValidator);

const PrivateAccessTokenValidator = z
  .object({
    challengeId: z.string()
  })
  .and(SharedChallengeMetadataValidator);

const DeviceIntegrityValidator = z
  .object({
    integrityType: z.string(),
    requestHash: z.string()
  })
  .and(SharedChallengeMetadataValidator);

const ProofOfSpaceValidator = z
  .object({
    challengeId: z.string(),
    artifacts: z.object({
      puzzleType: z.nativeEnum(ProofOfSpace.PuzzleType),
      seed: z.string(),
      rounds: z.string(),
      layers: z.string()
    })
  })
  .and(SharedChallengeMetadataValidator);

const PhoneVerificationValidator = z
  .object({
    frictionContext: z.nativeEnum(FrictionContext).optional()
  })
  .and(SharedChallengeMetadataValidator);

const EmailVerificationValidator = z
  .object({
    otpSession: z.string(),
    frictionContext: z.nativeEnum(FrictionContext).optional()
  })
  .and(SharedChallengeMetadataValidator);

/**
 * A dictionary of validators corresponding to the challenge metadata types
 * defined in the `interface` directory. The type constraints expressed here
 * will force the validators to remain synchronized with the interface.
 */
export const ChallengeMetadataValidator: {
  [K in ChallengeType]: z.ZodType<Metadata.Challenge<K>>;
} = {
  [ChallengeType.TWO_STEP_VERIFICATION]: TwoStepVerificationChallengeMetadataValidator,
  [ChallengeType.CAPTCHA]: CaptchaChallengeMetadataValidator,
  [ChallengeType.FORCE_AUTHENTICATOR]: ForceAuthenticatorValidator,
  [ChallengeType.FORCE_TWO_STEP_VERIFICATION]: ForceTwoStepVerificationValidator,
  [ChallengeType.SECURITY_QUESTIONS]: SecurityQuestionsChallengeMetadataValidator,
  [ChallengeType.REAUTHENTICATION]: ReauthenticationValidator,
  [ChallengeType.PROOF_OF_WORK]: ProofOfWorkValidator,
  [ChallengeType.ROSTILE]: RostileValidator,
  [ChallengeType.PRIVATE_ACCESS_TOKEN]: PrivateAccessTokenValidator,
  [ChallengeType.DEVICE_INTEGRITY]: DeviceIntegrityValidator,
  [ChallengeType.PROOF_OF_SPACE]: ProofOfSpaceValidator,
  [ChallengeType.PHONE_VERIFICATION]: PhoneVerificationValidator,
  [ChallengeType.EMAIL_VERIFICATION]: EmailVerificationValidator
};
