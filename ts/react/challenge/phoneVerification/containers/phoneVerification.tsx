import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import { UpsellService } from 'Roblox';
import usePhoneVerificationContext from '../hooks/usePhoneVerificationContext';
import { PhoneVerificationActionType } from '../store/action';
import {
  VERIFICATION_UPSELL_TRASLATION_KEY,
  PHONE_ROOT_ELEMENT_ID,
  UPSELL_ORIGIN
} from '../app.config';

import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import QuitVerificationConfirmation from '../../../common/quitVerificationConfirmation';

const PhoneVerification: React.FC = () => {
  const {
    state: { renderInline, resources, metricsService, eventService, isModalVisible },
    dispatch
  } = usePhoneVerificationContext();

  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const onModalAbandoned = useCallback(
    (isPhoneVerified: boolean) => {
      if (isPhoneVerified) {
        dispatch({
          type: PhoneVerificationActionType.SET_CHALLENGE_COMPLETED,
          onChallengeCompletedData: {}
        });
        eventService.sendChallengeCompletedEvent();
        metricsService.fireChallengeCompletedEvent();
        return;
      }

      setConfirmationModalVisible(true);
      dispatch({
        type: PhoneVerificationActionType.HIDE_MODAL_CHALLENGE
      });
    },
    [dispatch, eventService, metricsService]
  );

  const handleRejectAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: PhoneVerificationActionType.SHOW_MODAL_CHALLENGE
    });
  }, [dispatch]);

  const handleConfirmAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: PhoneVerificationActionType.SET_CHALLENGE_INVALIDATED,
      errorCode: 0
    });
    eventService.sendChallengeInvalidatedEvent();
    metricsService.fireChallengeInvalidatedEvent();
  }, [dispatch, eventService, metricsService]);

  useEffect(() => {
    if (isModalVisible) {
      UpsellService.renderPhoneUpsell({
        onClose: onModalAbandoned,
        origin: UPSELL_ORIGIN,
        addPhoneHeadingKey: VERIFICATION_UPSELL_TRASLATION_KEY.Header.VerifyYourAccountHeader,
        addPhoneDescriptionKey:
          VERIFICATION_UPSELL_TRASLATION_KEY.Description.SuspiciousActivityPhoneVerification,
        containerId: PHONE_ROOT_ELEMENT_ID,
        addPhoneLegalTextKey: VERIFICATION_UPSELL_TRASLATION_KEY.Description.LegalText,
        renderInWebview: renderInline
      });
    }
  }, [onModalAbandoned, isModalVisible]);

  /*
   * Rendering helpers
   */
  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;

    return (
      <React.Fragment>
        <BodyElement>
          <div id={PHONE_ROOT_ELEMENT_ID} />
        </BodyElement>
      </React.Fragment>
    );
  };

  const renderContent = () => {
    if (isConfirmationModalVisible) {
      return (
        <QuitVerificationConfirmation
          renderInline={renderInline}
          confirmAbandonLabel={resources.Label.ConfirmAbandon}
          rejectAbandonLabel={resources.Label.RejectAbandon}
          abandonConfirmationTitle={resources.Header.ConfirmAbandon}
          abandonConfirmationDescription={resources.Description.ConfirmAbandon}
          isConfirmationModalVisible={isConfirmationModalVisible}
          handleContinue={handleRejectAbandon}
          handleConfirmAbandon={handleConfirmAbandon}
        />
      );
    }

    if (renderInline) {
      return <InlineChallenge titleText=''>{getPageContent()}</InlineChallenge>;
    }

    return (
      <Modal className='modal-modern' backdrop='static' show={isModalVisible}>
        {getPageContent()}
      </Modal>
    );
  };

  return <React.Fragment>{renderContent()}</React.Fragment>;
};

export default PhoneVerification;
