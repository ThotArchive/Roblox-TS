import fpjs from '@fingerprintjs/fingerprintjs';
import Roblox from 'Roblox';
import * as z from 'zod';
import { RequestServiceDefault } from '../../../common/request';
import { GET_PRELUDE_CONFIG } from '../../../common/request/types/rotatingClient';
import * as Captcha from '../captcha';
import * as CaptchaInterface from '../captcha/interface';
import * as DeviceIntegrity from '../deviceIntegrity';
import * as DeviceIntegrityInterface from '../deviceIntegrity/interface';
import * as EmailVerification from '../emailVerification';
import * as EmailVerificationInterface from '../emailVerification/interface';
import * as ForceActionRedirect from '../forceActionRedirect';
import * as ForceActionRedirectInterface from '../forceActionRedirect/interface';
import { Generic } from '../interface';
import * as PhoneVerification from '../phoneVerification';
import * as PhoneVerificationInterface from '../phoneVerification/interface';
import * as PrivateAccessToken from '../privateAccessToken';
import * as PrivateAccessTokenInterface from '../privateAccessToken/interface';
import * as ProofOfSpace from '../proofOfSpace';
import * as ProofOfSpaceInterface from '../proofOfSpace/interface';
import * as ProofOfWork from '../proofOfWork';
import * as ProofOfWorkInterface from '../proofOfWork/interface';
import * as Reauthentication from '../reauthentication';
import * as ReauthenticationInterface from '../reauthentication/interface';
import * as Rostile from '../rostile';
import * as RostileInterface from '../rostile/interface';
import * as SecurityQuestions from '../securityQuestions';
import * as SecurityQuestionsInterface from '../securityQuestions/interface';
import * as TwoStepVerification from '../twoStepVerification';
import * as TwoStepVerificationInterface from '../twoStepVerification/interface';
import { EVENT_CONSTANTS, LOG_PREFIX } from './app.config';
import {
  ChallengeErrorData,
  ChallengeErrorKind,
  ChallengeErrorParameters,
  ChallengeSpecificProperties,
  ChallengeType,
  InterceptChallenge,
  ParseChallengeSpecificProperties,
  RenderChallenge,
  RetryRequest
} from './interface';
import * as Metadata from './interface/metadata/interface';
import { MetricsServiceDefault } from './services/metricsService';
import { ChallengeMetadataValidator } from './validators';

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ChallengeErrorKind, ChallengeType, ErrorCodeGeneric } from './interface';

// Initialize instance of `RequestService`.
const requestService = new RequestServiceDefault();

// Initialize instance of `MetricsService` to record parse and render failures.
const metricsService = new MetricsServiceDefault();

/**
 * Parses challenge-specific properties from a challenge type string and a JSON
 * string value representing challenge metadata.
 *
 * The output value of this function can (and almost always should) be passed
 * directly to `renderChallenge` as `challengeSpecificProperties`.
 */
export const parseChallengeSpecificProperties: ParseChallengeSpecificProperties = (
  challengeId,
  challengeTypeRaw,
  challengeMetadataJson
) => {
  const challengeType = Object.values(ChallengeType).includes(challengeTypeRaw as ChallengeType)
    ? (challengeTypeRaw as ChallengeType)
    : null;
  if (challengeType === null) {
    return null;
  }

  let challengeMetadata: unknown;
  try {
    challengeMetadata =
      challengeMetadataJson === null || challengeMetadataJson === ''
        ? {}
        : JSON.parse(challengeMetadataJson);
  } catch (error) {
    return null;
  }

  // This type hint is not strictly necessary, but it appears to improve IDE
  // type inference with regards to the `result` type below.
  const validator: z.ZodType<Metadata.Challenge<typeof challengeType>> =
    ChallengeMetadataValidator[challengeType];
  const result = validator.safeParse(challengeMetadata);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(LOG_PREFIX, result.error);
    return null;
  }

  // TypeScript cannot figure it out, so we must assert that the `challengeType`
  // and `challengeMetadata` are correlated properties (with a known challenge
  // type) when returning from this function.
  return {
    challengeId,
    challengeType,
    challengeMetadata
  } as ChallengeSpecificProperties;
};

/**
 * Renders the Generic Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = async ({
  challengeBaseProperties,
  challengeSpecificProperties
}): Promise<boolean> => {
  const {
    challengeMetadata: { sharedParameters }
  } = challengeSpecificProperties;

  // Determine if we should override `onChallengeCompleted` to redeem and render
  // the next challenge. We accomplish this by recursively calling `renderChallenge` until
  // no challenges remain in the session, then running the `onChallengeCompleted` callback of
  // the first challenge to retry and redeem the original request.
  // TODO(BNS-5347): Refactor this method now that continue mode is the default.
  const oldOnChallengeCompleted = challengeBaseProperties.onChallengeCompleted;
  // eslint-disable-next-line no-param-reassign
  challengeBaseProperties.onChallengeCompleted = async data => {
    const result = await requestService.genericChallenge.continueChallenge(
      sharedParameters?.genericChallengeId || challengeSpecificProperties.challengeId,
      data.challengeType,
      JSON.stringify(data.metadata)
    );

    if (result.isError) {
      metricsService.fireContinueFailureEvent(challengeSpecificProperties.challengeType);
      // TODO: Update with non-empty error message.
      challengeBaseProperties.onChallengeInvalidated({
        challengeType: challengeSpecificProperties.challengeType,
        errorCode: Generic.ErrorCodeGeneric.UNKNOWN,
        errorMessage: ''
      });
      return;
    }

    // No challenges remain.
    if (result.value.challengeType === '') {
      oldOnChallengeCompleted(data);
      return;
    }

    const nextChallengeSpecificProperties = parseChallengeSpecificProperties(
      result.value.challengeId,
      result.value.challengeType,
      result.value.challengeMetadata
    );
    if (nextChallengeSpecificProperties === null) {
      // Fail the request on a challenge that fails to be parsed.
      // eslint-disable-next-line no-console
      console.error(LOG_PREFIX, 'Challenge headers failed to be parsed');
      metricsService.fireParseFailureEvent();
      challengeBaseProperties.onChallengeInvalidated({
        challengeType: challengeSpecificProperties.challengeType,
        errorCode: Generic.ErrorCodeGeneric.UNKNOWN,
        errorMessage: ''
      });
      return;
    }

    // eslint-disable-next-line no-param-reassign
    challengeBaseProperties.onChallengeCompleted = oldOnChallengeCompleted;

    // Render next challenge.
    // eslint-disable-next-line no-void
    void renderChallenge({
      challengeBaseProperties,
      challengeSpecificProperties: nextChallengeSpecificProperties
    })
      .then(success => {
        if (!success) {
          // Record render failure.
          metricsService.fireRenderFailureEvent(nextChallengeSpecificProperties.challengeType);
          // eslint-disable-next-line no-console
          console.error(LOG_PREFIX, 'Challenge component failed to initialize');
          challengeBaseProperties.onChallengeInvalidated({
            challengeType: nextChallengeSpecificProperties.challengeType,
            errorCode: Generic.ErrorCodeGeneric.UNKNOWN,
            errorMessage: ''
          });
          return;
        }
        // Record successful render.
        metricsService.fireSuccessEvent(nextChallengeSpecificProperties.challengeType);
      })
      .catch(() => {
        metricsService.fireRenderFailureEvent(nextChallengeSpecificProperties.challengeType);
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, 'Exception on rendering challenge component');
        challengeBaseProperties.onChallengeInvalidated({
          challengeType: nextChallengeSpecificProperties.challengeType,
          errorCode: Generic.ErrorCodeGeneric.UNKNOWN,
          errorMessage: ''
        });
      });
  };

  // Decide whether to kick off client fingerprinting, whose value is retrieved
  // prior to challenge redemption. If so, we start the fingerprinting promise
  // and retrieve its result within a monkey-patched version of the completion
  // handler.
  if (sharedParameters?.shouldAnalyze === true) {
    const fpPromise = fpjs.load({
      monitoring: false
    });
    const onChallengeCompletedWithoutFingerprint = challengeBaseProperties.onChallengeCompleted;
    // eslint-disable-next-line no-param-reassign
    challengeBaseProperties.onChallengeCompleted = async data => {
      try {
        const agent = await fpPromise;
        const fp = await agent.get();
        const fpjsData: { [key: string]: unknown } = {};
        Object.entries(fp.components).forEach(([key, component]) => {
          if (key !== 'canvas') {
            fpjsData[key] =
              typeof component.value === 'object'
                ? JSON.stringify(component.value)
                : component.value;
          }
        });

        Roblox.EventStream.SendEventWithTarget(
          EVENT_CONSTANTS.eventName,
          EVENT_CONSTANTS.context.onCompleted,
          {
            challengeId: challengeSpecificProperties.challengeId,
            library: 'FPJS',
            version: fp.version,
            ...fpjsData
          },
          Roblox.EventStream.TargetTypes.WWW
        );
      } catch (exception) {
        // Do nothing; failure to send fingerprint in shadow mode is not a fatal
        // error for redemption.
      }
      return onChallengeCompletedWithoutFingerprint(data);
    };
  }

  // NOTE: We can only unpack the `challengeSpecificProperties` AFTER asserting
  // their challenge type. This limitation is due to TypeScript's inference
  // behavior around correlated types in objects—specifically, the correlation
  // decouples itself as soon as the object's fields are separated into
  // variables.
  switch (challengeSpecificProperties.challengeType) {
    case ChallengeType.CAPTCHA: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      // Construct the parameters object specific to `Captcha.renderChallenge` (a
      // challenge provider).
      // In general, this object is constructed by:
      //   1. Defining defaults for optional properties required by the provider
      //   2. Unpacking the base properties for the challenge
      //   3. Unpacking specific challenge metadata from the back-end
      //   4. Overriding any properties that don't match the provider's interface
      const fullParameters: CaptchaInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        appType: null,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              unifiedCaptchaId: data.captchaId,
              captchaToken: data.captchaToken,
              // GCS does not have access to the action type at the time of
              // redemption but needs it to record appropriate telemetry.
              actionType: challengeMetadata.actionType
            }
          })
      };
      return Captcha.renderChallenge(fullParameters);
    }

    case ChallengeType.FORCE_AUTHENTICATOR: {
      const { challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ForceActionRedirectInterface.ChallengeParameters = {
        forceActionRedirectChallengeType:
          ForceActionRedirectInterface.ForceActionRedirectChallengeType.ForceAuthenticator,
        ...challengeBaseProperties,
        ...challengeMetadata
      };
      const success = ForceActionRedirect.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.FORCE_TWO_STEP_VERIFICATION: {
      const { challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ForceActionRedirectInterface.ChallengeParameters = {
        forceActionRedirectChallengeType:
          ForceActionRedirectInterface.ForceActionRedirectChallengeType.ForceTwoStepVerification,
        ...challengeBaseProperties,
        ...challengeMetadata
      };
      const success = ForceActionRedirect.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.TWO_STEP_VERIFICATION: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: TwoStepVerificationInterface.ChallengeParameters = {
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data,
              challengeId: challengeMetadata.challengeId,
              actionType: challengeMetadata.actionType
            }
          })
      };
      const success = TwoStepVerification.renderChallenge(fullParameters);

      // Some consumers (e.g. the hybrid web view) make use of a callback for a
      // challenge being displayed, which is not a logical callback in most of our
      // challenge types. The generic wrapper polyfills support for this callback
      // by firing it when a challenge provider returns successfully.
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.SECURITY_QUESTIONS: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: SecurityQuestionsInterface.ChallengeParameters = {
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({ challengeType, metadata: data })
      };
      const success = SecurityQuestions.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.REAUTHENTICATION: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ReauthenticationInterface.ChallengeParameters = {
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({ challengeType, metadata: data })
      };
      const success = Reauthentication.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.PROOF_OF_WORK: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ProofOfWorkInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data,
              sessionId: challengeMetadata.sessionId
            }
          })
      };
      return Promise.resolve(ProofOfWork.renderChallenge(fullParameters));
    }

    case ChallengeType.ROSTILE: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: RostileInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data
            }
          })
      };
      return Promise.resolve(Rostile.renderChallenge(fullParameters));
    }

    case ChallengeType.PRIVATE_ACCESS_TOKEN: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: PrivateAccessTokenInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data
            }
          })
      };
      return Promise.resolve(PrivateAccessToken.renderChallenge(fullParameters));
    }

    case ChallengeType.DEVICE_INTEGRITY: {
      const { challengeId, challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: DeviceIntegrityInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        challengeId,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data
            }
          })
      };
      return Promise.resolve(DeviceIntegrity.renderChallenge(fullParameters));
    }

    case ChallengeType.PROOF_OF_SPACE: {
      const { challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ProofOfSpaceInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              ...data
            }
          })
      };
      return Promise.resolve(ProofOfSpace.renderChallenge(fullParameters));
    }

    case ChallengeType.PHONE_VERIFICATION: {
      const { challengeId, challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: PhoneVerificationInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        challengeId,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              frictionContext: challengeMetadata.frictionContext,
              ...data
            }
          })
      };
      const success = PhoneVerification.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.EMAIL_VERIFICATION: {
      const { challengeId, challengeType, challengeMetadata } = challengeSpecificProperties;
      const fullParameters: EmailVerificationInterface.ChallengeParameters = {
        onChallengeDisplayed: () => undefined,
        challengeId,
        ...challengeBaseProperties,
        ...challengeMetadata,
        onChallengeInvalidated: data =>
          challengeBaseProperties.onChallengeInvalidated({ challengeType, ...data }),
        onChallengeCompleted: data =>
          challengeBaseProperties.onChallengeCompleted({
            challengeType,
            metadata: {
              frictionContext: challengeMetadata.frictionContext,
              ...data
            }
          })
      };
      const success = EmailVerification.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    case ChallengeType.BLOCK_SESSION: {
      const { challengeMetadata } = challengeSpecificProperties;
      const fullParameters: ForceActionRedirectInterface.ChallengeParameters = {
        forceActionRedirectChallengeType:
          ForceActionRedirectInterface.ForceActionRedirectChallengeType.BlockSession,
        ...challengeBaseProperties,
        ...challengeMetadata
      };
      const success = ForceActionRedirect.renderChallenge(fullParameters);
      if (success && challengeBaseProperties.onChallengeDisplayed !== undefined) {
        challengeBaseProperties.onChallengeDisplayed({ displayed: true });
      }
      return Promise.resolve(success);
    }

    default: {
      // If we have handled all of the challenge types above, TypeScript will
      // infer `challengeSpecificProperties` to have type `never` and the
      // following assignment should compile successfully.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const assertCodeIsUnreachable: never = challengeSpecificProperties;
      return false;
    }
  }
};

/**
 * A class name used to match objects that have different prototype paths.
 */
const GCS_CLASSNAME = 'generic-challenge-error';

/**
 * A custom error type to propagate challenge failures from a generic challenge
 * interceptor.
 */
export class ChallengeError<P extends ChallengeErrorParameters = ChallengeErrorParameters>
  extends Error
  implements ChallengeError<P> {
  /**
   * Helper function to match against any errors returned from the Generic
   * Challenge Flow.
   */
  public static match(error: unknown): error is ChallengeError {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    // eslint-disable-next-line no-underscore-dangle
    const maybeGcsErrorClass = (error as { _className?: string })._className;
    return maybeGcsErrorClass === GCS_CLASSNAME;
  }

  /**
   * Helper function to match against any challenge abandons returned from the
   * Generic Challenge Flow.
   */
  public static matchAbandoned(
    error: unknown
  ): error is ChallengeError<{
    kind: ChallengeErrorKind.ABANDONED;
    data: ChallengeErrorData<ChallengeErrorKind.ABANDONED>;
  }> {
    return ChallengeError.match(error) && error.parameters.kind === ChallengeErrorKind.ABANDONED;
  }

  private static getMessage(parameters: ChallengeErrorParameters): string {
    return `Got (${[
      `Kind: ${parameters.kind}`,
      `Type: ${parameters.data.challengeType || 'unknown'}`,
      `Code: ${
        parameters.kind === ChallengeErrorKind.INVALIDATED ? parameters.data.errorCode : 'null'
      }`
    ].join('; ')})`;
  }

  private _parameters: P;

  public get parameters(): P {
    return this._parameters;
  }

  // We can't use symbols because some parts of Roblox still run on IE11.
  private _className: string;

  constructor(parameters: P) {
    super(ChallengeError.getMessage(parameters));
    Object.setPrototypeOf(this, ChallengeError.prototype);
    this.name = ChallengeError.name;
    this._parameters = parameters;
    // TODO: Convert this to a Symbol once we're fully migrated off of IE11.
    this._className = GCS_CLASSNAME;
  }
}

/**
 * Wraps `renderChallenge` to retry an HTTP request on challenge success or
 * throw an appropriate `ChallengeError` on challenge failure.
 */
export const interceptChallenge: InterceptChallenge = <T>(parameters: {
  retryRequest: RetryRequest<T>;
  containerId: string;
  challengeId: string;
  challengeTypeRaw: string;
  challengeMetadataJsonBase64: string;
}): Promise<T> =>
  new Promise((resolve, reject) => {
    const {
      retryRequest,
      containerId,
      challengeId,
      challengeTypeRaw,
      challengeMetadataJsonBase64
    } = parameters;
    let challengeMetadataJson: string;
    try {
      challengeMetadataJson = atob(challengeMetadataJsonBase64);
    } catch (error) {
      // Specifically catch and suppress if `atob` gets invalid Base-64 input.
      if (error instanceof DOMException && error.code === DOMException.INVALID_CHARACTER_ERR) {
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, 'Base-64 decoding failed', error);
        reject(
          new ChallengeError({
            kind: ChallengeErrorKind.UNKNOWN,
            data: {}
          })
        );
        return;
      }
      throw error;
    }

    const challengeSpecificProperties = parseChallengeSpecificProperties(
      challengeId,
      challengeTypeRaw,
      challengeMetadataJson
    );
    if (challengeSpecificProperties === null) {
      // Fail the request on a challenge that fails to be parsed.
      // eslint-disable-next-line no-console
      console.error(LOG_PREFIX, 'Challenge headers failed to be parsed');
      reject(
        new ChallengeError({
          kind: ChallengeErrorKind.UNKNOWN,
          data: {}
        })
      );

      metricsService.fireParseFailureEvent();
      return;
    }

    const challengeSpecificContainerId = `${containerId}-${challengeTypeRaw}`;
    // Ensure that we have a hidden container to render into.
    if (document.getElementById(challengeSpecificContainerId) === null) {
      const genericChallengeContainer = document.createElement('div');
      genericChallengeContainer.id = challengeSpecificContainerId;
      document.body.appendChild(genericChallengeContainer);
    }

    // Attempt to render the challenge.
    // eslint-disable-next-line no-void
    void renderChallenge({
      challengeBaseProperties: {
        containerId: challengeSpecificContainerId,
        renderInline: false,
        onChallengeCompleted: data => {
          // Retry the request on success.
          try {
            resolve(retryRequest(challengeId, btoa(JSON.stringify(data.metadata))));
          } catch (error) {
            // Specifically catch and suppress if `btoa` gets invalid input (can
            // happen with wide Unicode code points).
            if (
              error instanceof DOMException &&
              error.code === DOMException.INVALID_CHARACTER_ERR
            ) {
              // eslint-disable-next-line no-console
              console.error(LOG_PREFIX, 'Base-64 encoding failed', error);
              reject(
                new ChallengeError({
                  kind: ChallengeErrorKind.UNKNOWN,
                  data: {
                    challengeType: challengeSpecificProperties.challengeType
                  }
                })
              );
            } else {
              throw error;
            }
          }
        },
        onChallengeInvalidated: data =>
          // Fail the request on an invalidated challenge.
          reject(
            new ChallengeError({
              kind: ChallengeErrorKind.INVALIDATED,
              data
            })
          ),
        onModalChallengeAbandoned: () =>
          // Fail the request on an abandoned challenge.
          reject(
            new ChallengeError({
              kind: ChallengeErrorKind.ABANDONED,
              data: {
                challengeType: challengeSpecificProperties.challengeType
              }
            })
          )
      },
      challengeSpecificProperties
    }).then(success => {
      if (!success) {
        // Record render failure.
        metricsService.fireRenderFailureEvent(challengeSpecificProperties.challengeType);

        // Fail the request on a challenge that fails to initialize.
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, 'Challenge component failed to initialize');
        reject(
          new ChallengeError({
            kind: ChallengeErrorKind.UNKNOWN,
            data: {
              challengeType: challengeSpecificProperties.challengeType
            }
          })
        );
      } else {
        // Record successful render.
        metricsService.fireSuccessEvent(challengeSpecificProperties.challengeType);
      }
    });
  });

// TODO: possibly move this into grasshopper and the invocation to corescripts when its ready.
export const loadPreludeIfMissing = (): void => {
  const maybePreludeExists = document.getElementById('prelude');
  if (maybePreludeExists === null) {
    const prelude = document.createElement('script');
    prelude.src = GET_PRELUDE_CONFIG.url;
    prelude.async = true;
    prelude.id = 'prelude';
    document.body.appendChild(prelude);
  }
};
