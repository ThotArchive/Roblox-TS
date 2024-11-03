import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { Modal } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import { hybridResponseService } from 'core-roblox-utilities';
import { TwoStepVerificationError } from '../../../../common/request/types/twoStepVerification';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { TIMEOUT_BEFORE_CALLBACK_MILLISECONDS } from '../app.config';
import MediaTypeList from '../components/mediaTypeList';
import SwitchMediaType from '../components/switchMediaType';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource
} from '../constants/resources';
import { mediaTypeToPath, useActiveMediaType } from '../hooks/useActiveMediaType';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { ActionType, MediaType } from '../interface';
import { TwoStepVerificationActionType } from '../store/action';
import AuthenticatorInput from './authenticatorInput';
import EmailInput from './emailInput';
import RecoveryCodeInput from './recoveryCodeInput';
import SecurityKeyInput from './securityKeyInput';
import SmsInput from './smsInput';
import CD2SVInput from './cd2svInput';
import PasskeyInput from './passkeyInput';

/**
 * A container element for the 2SV UI.
 */
const TwoStepVerification: React.FC = () => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      metadata,
      enabledMediaTypes,
      resources,
      eventService,
      metricsService,
      requestService,
      onModalChallengeAbandoned,
      isModalVisible
    },
    dispatch
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();
  const history = useHistory();

  /*
   * Component State
   */

  const [hasSentEmailCode, setHasSentEmailCode] = useState<boolean>(false);
  const [hasSentSmsCode, setHasSentSmsCode] = useState<boolean>(false);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [modalTitleText, setModalTitleText] = useState<string>(resources.Label.TwoStepVerification);
  const [showChangeMediaType, setShowChangeMediaType] = useState<boolean>(true);

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: TwoStepVerificationActionType.HIDE_MODAL_CHALLENGE
    });

    eventService.sendChallengeAbandonedEvent(activeMediaType);
    metricsService.fireAbandonedEvent();

    // Attempt to retract dialog on cross device but ignore errors if they occur.
    if (activeMediaType === MediaType.CrossDevice) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      requestService.twoStepVerification.retractCrossDevice(userId, {
        challengeId,
        actionType
      });
    }
    if (onModalChallengeAbandoned !== null) {
      // Set a timeout to ensure that any events and metrics have a better
      // chance to complete.
      setTimeout(
        () =>
          onModalChallengeAbandoned(() =>
            dispatch({
              type: TwoStepVerificationActionType.SHOW_MODAL_CHALLENGE
            })
          ),
        TIMEOUT_BEFORE_CALLBACK_MILLISECONDS
      );
    }
  };

  /*
   * Effects
   */

  // Idempotent function (no cleanup required):
  const loadChallenge = async () => {
    setPageLoadError(null);
    if (metadata !== null) {
      return;
    }

    // Retrieve metadata state.
    const resultMetadata = await requestService.twoStepVerification.getMetadata({
      userId,
      challengeId,
      actionType
    });
    if (resultMetadata.isError) {
      if (
        resultMetadata.error === TwoStepVerificationError.INVALID_USER_ID ||
        resultMetadata.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
      ) {
        dispatch({
          type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(resultMetadata.error)
        });
      } else {
        setPageLoadError(mapTwoStepVerificationErrorToResource(resources, resultMetadata.error));
      }
      return;
    }

    // Retrieve user configuration state.
    const resultUserConfiguration = await requestService.twoStepVerification.getUserConfiguration(
      userId,
      {
        challengeId,
        actionType
      }
    );
    if (resultUserConfiguration.isError) {
      if (
        resultUserConfiguration.error === TwoStepVerificationError.INVALID_USER_ID ||
        resultUserConfiguration.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
      ) {
        dispatch({
          type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(resultUserConfiguration.error)
        });
      } else {
        setPageLoadError(
          mapTwoStepVerificationErrorToResource(resources, resultUserConfiguration.error)
        );
      }
      return;
    }

    // Set metadata state.
    dispatch({
      type: TwoStepVerificationActionType.SET_METADATA,
      metadata: resultMetadata.value
    });

    // Set user configuration state (including inferred media type info).
    let primaryMediaType =
      MediaType[resultUserConfiguration.value.primaryMediaType as keyof typeof MediaType] || null;

    const newEnabledMediaTypes = resultUserConfiguration.value.methods
      .filter(({ enabled }) => enabled)
      .map(
        ({ mediaType: enabledMediaType }) =>
          MediaType[enabledMediaType as keyof typeof MediaType] || null
      );

    const isInApp = DeviceMeta && DeviceMeta().isInApp;
    // Check if WebAuthn is supported or if we are allowing security keys on all platforms.
    let fido2SupportedViaBrowserApi = true;
    try {
      if (isInApp || PublicKeyCredential === undefined) {
        fido2SupportedViaBrowserApi = false;
      }
    } catch (e) {
      fido2SupportedViaBrowserApi = false;
    }

    // If security keys are the primary media type, determine if we need to search for a native
    // fallback API using hybrid calls. Only iOS and Android are supported as of now.
    const isInIosOrAndroidApp =
      DeviceMeta &&
      (DeviceMeta().isIosApp ||
        (DeviceMeta().isAndroidApp && resultMetadata.value.isAndroidSecurityKeyEnabled));
    let fido2SupportedViaHybridApi = false;
    if (
      primaryMediaType === MediaType.SecurityKey &&
      isInApp &&
      isInIosOrAndroidApp &&
      resultMetadata.value.isSecurityKeyOnAllPlatformsEnabled
    ) {
      const isAvailable = await hybridResponseService.getNativeResponse(
        hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
        {},
        2000
      );
      if (isAvailable === 'true') {
        fido2SupportedViaHybridApi = true;
      }
    }

    if (
      primaryMediaType === MediaType.SecurityKey &&
      !fido2SupportedViaBrowserApi &&
      !fido2SupportedViaHybridApi
    ) {
      primaryMediaType = MediaType.Authenticator;
    }

    if (
      primaryMediaType === MediaType.Passkey &&
      !fido2SupportedViaBrowserApi &&
      !fido2SupportedViaHybridApi
    ) {
      if (newEnabledMediaTypes.includes(MediaType.Passkey)) {
        newEnabledMediaTypes.splice(newEnabledMediaTypes.indexOf(MediaType.Passkey), 1);
      }
      if (newEnabledMediaTypes.length === 0) {
        eventService.sendNoEnabledMethodsReturnedEvent(
          primaryMediaType,
          resultUserConfiguration.value.methods.length
        );
      } else {
        // eslint-disable-next-line prefer-destructuring
        primaryMediaType = newEnabledMediaTypes[0];
      }
    }

    history.replace(mediaTypeToPath(primaryMediaType));
    if (primaryMediaType === MediaType.Email) {
      setHasSentEmailCode(true);
    }
    // Track unexpected event where no valid 2SV methods are returned for a user with 2SV enabled.
    if (newEnabledMediaTypes.length === 0 || !primaryMediaType) {
      eventService.sendNoEnabledMethodsReturnedEvent(
        primaryMediaType,
        resultUserConfiguration.value.methods.length
      );
    }

    // Remove security keys as a 2FA option if it is not supported.
    if (
      newEnabledMediaTypes.includes(MediaType.SecurityKey) &&
      !fido2SupportedViaBrowserApi &&
      !fido2SupportedViaHybridApi
    ) {
      newEnabledMediaTypes.splice(newEnabledMediaTypes.indexOf(MediaType.SecurityKey), 1);
    }

    // TODO: Remove this logic after https://jira.rbx.com/browse/BNS-1903 is
    // merged and deployed. We explicitly add recovery codes to the list of
    // available method types if the action type is Login (and there is at
    // least one other method type available).
    if (
      newEnabledMediaTypes.length > 0 &&
      actionType === ActionType.Login &&
      !newEnabledMediaTypes.includes(MediaType.RecoveryCode)
    ) {
      newEnabledMediaTypes.push(MediaType.RecoveryCode);
    }

    dispatch({
      type: TwoStepVerificationActionType.SET_USER_CONFIGURATION,
      userConfiguration: resultUserConfiguration.value,
      enabledMediaTypes: newEnabledMediaTypes
    });

    eventService.sendUserConfigurationLoadedEvent(primaryMediaType);
  };

  // Effect to retrieve 2SV metadata and user configuration:
  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Render Properties
   */

  const reloadButton: FooterButtonConfig = {
    content: resources.Action.Reload,
    label: resources.Action.Reload,
    enabled: pageLoadError !== null,
    action: loadChallenge
  };

  /*
   * Rendering Helpers
   */

  const renderMediaTypeWithChildren = (children: React.ReactFragment) => {
    return (
      <Switch>
        <Route path={mediaTypeToPath(MediaType.Authenticator)}>
          <AuthenticatorInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </AuthenticatorInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.Email)}>
          <EmailInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </EmailInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.RecoveryCode)}>
          <RecoveryCodeInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </RecoveryCodeInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.SMS)}>
          <SmsInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </SmsInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.SecurityKey)}>
          <SecurityKeyInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </SecurityKeyInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.CrossDevice)}>
          <CD2SVInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}
            setModalTitleText={setModalTitleText}
            setShowChangeMediaType={setShowChangeMediaType}>
            {children}
          </CD2SVInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.Passkey)}>
          <PasskeyInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </PasskeyInput>
        </Route>
        <Route>
          <MediaTypeList
            hasSentEmailCode={hasSentEmailCode}
            setHasSentEmailCode={setHasSentEmailCode}
            hasSentSmsCode={hasSentSmsCode}
            setHasSentSmsCode={setHasSentSmsCode}
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}
            setModalTitleText={setModalTitleText}>
            {children}
          </MediaTypeList>
        </Route>
      </Switch>
    );
  };

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
    const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;

    if (pageLoadError) {
      return (
        <React.Fragment>
          <BodyElement>
            <p>{pageLoadError}</p>
          </BodyElement>
          <FooterElement positiveButton={reloadButton} negativeButton={null} />
        </React.Fragment>
      );
    }

    if (!metadata) {
      return (
        <BodyElement>
          <span className='spinner spinner-default spinner-no-margin modal-margin-bottom-large' />
        </BodyElement>
      );
    }

    return renderMediaTypeWithChildren(
      <React.Fragment>
        {activeMediaType && enabledMediaTypes.length > 1 && showChangeMediaType && (
          <SwitchMediaType requestInFlight={requestInFlight} />
        )}
      </React.Fragment>
    );
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={modalTitleText}>{getPageContent()}</InlineChallenge>
  ) : (
    <Modal className='modal-modern' show={isModalVisible} onHide={closeModal} backdrop='static'>
      <FragmentModalHeader
        headerText={modalTitleText}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};

export default TwoStepVerification;
