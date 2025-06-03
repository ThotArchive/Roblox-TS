import { fido2Util, hybridResponseService } from 'core-roblox-utilities';
import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import * as TwoStepVerification from '../../../../common/request/types/twoStepVerification';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import RememberDeviceCheckBox from '../components/rememberDeviceCheckBox';
import SupportHelp from '../components/supportHelp';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource
} from '../constants/resources';
import { useActiveMediaType } from '../hooks/useActiveMediaType';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { TwoStepVerificationActionType } from '../store/action';

type Props = {
  requestInFlight: boolean;
  setRequestInFlight: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A container element for the Passkey verification UI.
 */
const PasskeyInput: React.FC<Props> = ({
  requestInFlight,
  setRequestInFlight,
  children
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      shouldShowRememberDeviceCheckbox,
      resources,
      metadata,
      eventService,
      metricsService,
      requestService
    },
    dispatch
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState<boolean>(false);

  /*
   * Helper Functions
   */

  const handleError = (
    error: TwoStepVerification.TwoStepVerificationError | null,
    sendEvent: boolean
  ) => {
    if (sendEvent) {
      eventService.sendCodeVerificationFailedEvent(
        activeMediaType,
        actionType,
        TwoStepVerification.TwoStepVerificationError[
          error || TwoStepVerification.TwoStepVerificationError.UNKNOWN
        ]
      );
    }
    if (
      error === TwoStepVerification.TwoStepVerificationError.INVALID_USER_ID ||
      error === TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID
    ) {
      dispatch({
        type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
        errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(error)
      });
      return;
    }

    setRequestInFlight(false);
    setRequestError(mapTwoStepVerificationErrorToResource(resources, error));
  };

  /*
   * Event Handlers
   */

  const verifyCode = async () => {
    setRequestInFlight(true);
    setRequestError(null);

    const options = await requestService.twoStepVerification.getPasskeyOptions(userId, {
      challengeId,
      actionType
    });

    if (options.isError) {
      handleError(options.error, true);
      return;
    }

    const shouldConvertToStandardBase64 = !(
      DeviceMeta &&
      DeviceMeta().isInApp &&
      DeviceMeta().isAndroidApp
    );
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const makeAssertionOptions = shouldConvertToStandardBase64
      ? fido2Util.convertPublicKeyParametersToStandardBase64(options.value.authenticationOptions)
      : JSON.parse(options.value.authenticationOptions);
    if (!makeAssertionOptions.publicKey) {
      handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
      return;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    let code = '';
    if (DeviceMeta && DeviceMeta().isInApp) {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      makeAssertionOptions.keyType = 'platform';
      // If we're in a web-view and Passkeys are enabled, we should call the native implementation of FIDO2.
      const credentialString = await hybridResponseService
        .getNativeResponse(
          hybridResponseService.FeatureTarget.GET_CREDENTIALS,
          {
            authenticationOptionsJSON: JSON.stringify(makeAssertionOptions)
          },
          300000
        )
        .catch(() => {
          handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        });
      if (credentialString == null) {
        handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        return;
      }
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const credential = JSON.parse(credentialString);
      // check for error here
      if (credential.errorCode !== undefined) {
        handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        return;
      }
      try {
        code = shouldConvertToStandardBase64
          ? fido2Util.formatCredentialAuthenticationResponseApp(credentialString)
          : credentialString;
      } catch {
        handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        return;
      }
    } else {
      const credential = await navigator.credentials
        .get({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeAssertionOptions))
        })
        .catch(() => {
          handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        });
      try {
        code = fido2Util.formatCredentialAuthenticationResponseWeb(
          credential as PublicKeyCredential
        );
      } catch {
        handleError(TwoStepVerification.TwoStepVerificationError.UNKNOWN, false);
        return;
      }
    }
    const result = await requestService.twoStepVerification.verifyPasskeyCredential(userId, {
      challengeId,
      actionType,
      code
    });

    if (result.isError) {
      handleError(result.error, true);
      return;
    }

    eventService.sendCodeVerifiedEvent(activeMediaType, actionType);
    metricsService.fireVerifiedEvent(activeMediaType);

    dispatch({
      type: TwoStepVerificationActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        verificationToken: result.value.verificationToken,
        rememberDevice
      }
    });
  };

  /*
   * Render Properties
   */

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomClassName = renderInline
    ? 'inline-challenge-margin-bottom'
    : 'modal-margin-bottom';
  let actionButtonClassName = renderInline
    ? 'inline-challenge-action-button'
    : 'modal-action-button';
  actionButtonClassName = actionButtonClassName.concat(' ', 'btn-cta-md');
  actionButtonClassName = actionButtonClassName.concat(' ', marginBottomClassName);
  const marginBottomLargeClassName = renderInline
    ? 'inline-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';
  const textErrorClassName = marginBottomLargeClassName.concat(' ', 'text-error xsmall');
  const marginBottomSmallClassName = renderInline
    ? 'inline-challenge-margin-bottom-sm'
    : 'modal-margin-bottom-sm';

  /*
   * Component Markup
   */

  return (
    metadata && (
      <React.Fragment>
        <BodyElement>
          <div className={lockIconClassName} />
          <p className={marginBottomSmallClassName}>{resources.Label.VerifyWithPasskey}</p>
          <p className={marginBottomClassName}>{resources.Label.PasskeyDirections}</p>
          <button
            type='button'
            className={actionButtonClassName}
            aria-label={resources.Action.Verify}
            disabled={requestInFlight}
            onClick={verifyCode}>
            {requestInFlight ? (
              <span className='spinner spinner-xs spinner-no-margin' />
            ) : (
              resources.Action.Verify
            )}
          </button>
          {shouldShowRememberDeviceCheckbox && (
            <RememberDeviceCheckBox
              disabled={requestInFlight}
              rememberDevice={rememberDevice}
              setRememberDevice={setRememberDevice}
              className={marginBottomClassName}
            />
          )}
          {children}
          <SupportHelp className={marginBottomClassName} />
          <p className={textErrorClassName}>{requestError}</p>
        </BodyElement>
      </React.Fragment>
    )
  );
};

export default PasskeyInput;
