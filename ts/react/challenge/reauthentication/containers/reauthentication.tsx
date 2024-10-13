import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { Modal } from 'react-style-guide';
import InlineChallenge from '../../../common/inlineChallenge';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import AlternativeReauthMethodsButton from '../components/alternativeReauthMethodsButton';
import {
  reauthenticationTypeToPath,
  useActiveReauthenticationType
} from '../hooks/useActiveReauthenticationType';
import useReauthenticationContext from '../hooks/useReauthenticationContext';
import { ReauthenticationType } from '../interface';
import { ReauthenticationActionType } from '../store/action';
import PasskeyInput from './passkeyInput';
import OtpInput from './otpInput';
import PasswordInput from './passwordInput';
import ReauthList from './reauthList';
import { isPasskeySupported } from '../utils';

/*
 * A container element for the Re-authentication UI.
 */
const Reauthentication: React.FC = () => {
  const {
    state: {
      availableTypes,
      resources,
      defaultType,
      renderInline,
      isModalVisible,
      metricsService,
      eventService,
      onModalChallengeAbandoned
    },
    dispatch
  } = useReauthenticationContext();

  const requestInFlightState = useState<boolean>(false);
  const requestErrorState = useState<string | null>('');
  const otpResendCodeRemainingTimeState = useState<number>(30);
  const activeReauthenticationType = useActiveReauthenticationType();

  const closeModal = () => {
    dispatch({
      type: ReauthenticationActionType.HIDE_MODAL_CHALLENGE
    });
    metricsService.fireAbandonedEvent(activeReauthenticationType);
    eventService.sendChallengeAbandonedEvent(activeReauthenticationType);
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: ReauthenticationActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  };

  // We use history and page routing because all of the different platform-native implementations
  // of web views (which end up at this page) have an incomplete implementation that always shows
  // a back button regardless of the current page's stack. That button closes the web view if there
  // is no history in the stack; so we artificially populate "pages" to work around that behavior.

  // In the long term empty history should gray out the webview back button (or not render it)
  // altogether.
  const history = useHistory();
  const canRenderAlternativeMethodButton = availableTypes.length > 1;

  /*
   * Effects
   */

  const loadChallenge = async () => {
    if (defaultType === ReauthenticationType.Passkey) {
      const passKeySupported = await isPasskeySupported();
      let newDefaultType = defaultType as ReauthenticationType;
      if (!passKeySupported) {
        const newAvailableTypes = availableTypes.filter((availableType: ReauthenticationType) => {
          return availableType !== ReauthenticationType.Passkey;
        });
        // Return an error if there are no other available methods.
        if (newAvailableTypes.length === 0) {
          dispatch({
            type: ReauthenticationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: 0
          });
          return;
        }
        newDefaultType = newAvailableTypes[newAvailableTypes.length - 1];
        dispatch({
          type: ReauthenticationActionType.SET_REAUTHENTICATION_TYPES,
          defaultType: newDefaultType,
          availableTypes: newAvailableTypes
        });
      }
      history.replace(newDefaultType);
      return;
    }
    // Automatically route to the default type for a particular user.
    history.replace(defaultType);
  };

  // Effect to set initial modal state
  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Rendering
   */

  const getPageContent = () => {
    return (
      <Switch>
        <Route path={reauthenticationTypeToPath(ReauthenticationType.Passkey)}>
          <PasskeyInput
            requestInFlightState={requestInFlightState}
            requestErrorState={requestErrorState}>
            {canRenderAlternativeMethodButton && (
              <AlternativeReauthMethodsButton
                requestInFlight={requestInFlightState[0]}
                setRequestError={requestErrorState[1]}
              />
            )}
          </PasskeyInput>
        </Route>
        <Route path={reauthenticationTypeToPath(ReauthenticationType.OtpEmail)}>
          <OtpInput
            otpResendCodeRemainingTimeState={otpResendCodeRemainingTimeState}
            requestInFlightState={requestInFlightState}
            requestErrorState={requestErrorState}>
            {canRenderAlternativeMethodButton && (
              <AlternativeReauthMethodsButton
                requestInFlight={requestInFlightState[0]}
                setRequestError={requestErrorState[1]}
              />
            )}
          </OtpInput>
        </Route>
        <Route path={reauthenticationTypeToPath(ReauthenticationType.Password)}>
          <PasswordInput
            requestInFlightState={requestInFlightState}
            requestErrorState={requestErrorState}>
            {canRenderAlternativeMethodButton && (
              <AlternativeReauthMethodsButton
                requestInFlight={requestInFlightState[0]}
                setRequestError={requestErrorState[1]}
              />
            )}
          </PasswordInput>
        </Route>
        {canRenderAlternativeMethodButton && (
          <Route>
            <ReauthList
              listItemConfig={availableTypes.map(availableType => {
                return {
                  [ReauthenticationType.Password]: {
                    rowLabel: resources.Label.Password,
                    rowIcon: 'icon-status-private',
                    requestInFlight: requestInFlightState[0],
                    typeToBeSelected: ReauthenticationType.Password
                  },
                  [ReauthenticationType.OtpEmail]: {
                    rowLabel: resources.Label.OneTimeCode,
                    rowIcon: 'icon-status-private',
                    requestInFlight: requestInFlightState[0],
                    typeToBeSelected: ReauthenticationType.OtpEmail
                  },
                  [ReauthenticationType.Passkey]: {
                    rowLabel: resources.Label.Passkey,
                    rowIcon: 'icon-status-private',
                    requestInFlight: requestInFlightState[0],
                    typeToBeSelected: ReauthenticationType.Passkey
                  }
                }[availableType];
              })}
            />
          </Route>
        )}
      </Switch>
    );
  };

  const getHeaderTextResourceByReauthenticationType = (): string => {
    return activeReauthenticationType === null
      ? resources.Header.VerificationMethodSelection
      : {
          [ReauthenticationType.Password]: resources.Header.PasswordVerification,
          [ReauthenticationType.OtpEmail]: resources.Header.OtpVerification,
          [ReauthenticationType.Passkey]: resources.Header.PasskeyVerification
        }[activeReauthenticationType];
  };

  const inlineChallengeComponent = (
    <InlineChallenge titleText={getHeaderTextResourceByReauthenticationType()}>
      {getPageContent()}
    </InlineChallenge>
  );

  const modalChallengeComponent = (
    <Modal className='modal-modern' show={isModalVisible} onHide={closeModal} backdrop='static'>
      <FragmentModalHeader
        headerText={getHeaderTextResourceByReauthenticationType()}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlightState[0]}
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );

  return renderInline ? inlineChallengeComponent : modalChallengeComponent;
};

export default Reauthentication;
