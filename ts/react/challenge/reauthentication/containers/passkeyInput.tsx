import { fido2Util, hybridResponseService } from 'core-roblox-utilities';
import React, { ReactNode } from 'react';
import { Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import {
  mapFido2ErrorToResource,
  mapReauthenticationErrorToResource
} from '../constants/resources';
import useReauthenticationContext from '../hooks/useReauthenticationContext';
import { ReauthenticationType } from '../interface';
import { ReauthenticationActionType } from '../store/action';

type Props = {
  requestInFlightState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  requestErrorState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
  children: ReactNode;
};

/**
 * A component to handle passkeys for Reauthentication.
 */

const PasskeyInput: React.FC<Props> = ({ requestInFlightState, requestErrorState, children }) => {
  const {
    state: { renderInline, resources, requestService, defaultTypeMetadata },
    dispatch
  } = useReauthenticationContext();

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = requestInFlightState;
  const [requestError, setRequestError] = requestErrorState;

  /*
   * Event Handlers
   */

  const verifyCode = async () => {
    setRequestInFlight(true);
    setRequestError(null);

    if (
      defaultTypeMetadata === null ||
      defaultTypeMetadata.passkeyAuthOptions === undefined ||
      defaultTypeMetadata.passkeySessionId === undefined
    ) {
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
      setRequestInFlight(false);
      return;
    }

    const shouldConvertToStandardBase64 = !(
      DeviceMeta &&
      DeviceMeta().isInApp &&
      DeviceMeta().isAndroidApp
    );

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const makeAssertionOptions = shouldConvertToStandardBase64
      ? fido2Util.convertPublicKeyParametersToStandardBase64(defaultTypeMetadata.passkeyAuthOptions)
      : JSON.parse(defaultTypeMetadata.passkeyAuthOptions);
    if (!makeAssertionOptions.publicKey) {
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
      setRequestInFlight(false);
      return;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    let code = '';
    if (DeviceMeta && DeviceMeta().isInApp) {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      makeAssertionOptions.keyType = 'platform';
      // If we're in a web-view and Passkeys are enabled, we should call the native implementation of FIDO2.
      const getNativeResponseResult = await requestService.fido2.getNativeResponse(
        hybridResponseService.FeatureTarget.GET_CREDENTIALS,
        {
          authenticationOptionsJSON: JSON.stringify(makeAssertionOptions)
        },
        300000
      );
      if (getNativeResponseResult.isError) {
        setRequestError(mapFido2ErrorToResource(resources, getNativeResponseResult.error));
        setRequestInFlight(false);
        return;
      }
      if (getNativeResponseResult.value === null) {
        setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
        setRequestInFlight(false);
        return;
      }
      code = getNativeResponseResult.value;
    } else {
      const getNavigatorCredentialsResult = await requestService.fido2.getNavigatorCredentials({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeAssertionOptions))
      });
      if (getNavigatorCredentialsResult.isError || getNavigatorCredentialsResult.value == null) {
        setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
        setRequestInFlight(false);
        return;
      }
      code = getNavigatorCredentialsResult.value;
    }
    const result = await requestService.reauthentication.generateToken({
      password: code,
      sessionId: defaultTypeMetadata.passkeySessionId,
      type: ReauthenticationType.Passkey
    });
    if (result.isError) {
      setRequestError(
        `${mapReauthenticationErrorToResource(resources, result.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    // Handle request success (token generated).
    setRequestError(null);
    dispatch({
      type: ReauthenticationActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        reauthenticationToken: result.value.token
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
    defaultTypeMetadata && (
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
          {children}
          <p className={textErrorClassName}>{requestError}</p>
        </BodyElement>
      </React.Fragment>
    )
  );
};

export default PasskeyInput;
