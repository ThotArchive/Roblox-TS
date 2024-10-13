import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-style-guide';
import { EmailVerifyCodeModalService } from 'Roblox';

import { OTP_CONTAINER_ID } from '../app.config';
import * as Otp from '../../../../common/request/types/otp';

import useEmailVerificationContext from '../hooks/useEmailVerificationContext';

import { EmailVerificationActionType } from '../store/action';
import { useOtpCodeLength } from '../hooks/useOtpCodeLength';

import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import QuitVerificationConfirmation from '../../../common/quitVerificationConfirmation';

const EmailVerification: React.FC = () => {
  const {
    state: { renderInline, resources, translate, eventService, metricsService, isModalVisible },
    dispatch
  } = useEmailVerificationContext();

  const otpCodeLength = useOtpCodeLength();

  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const onModalAbandoned = useCallback(() => {
    setConfirmationModalVisible(true);
    dispatch({
      type: EmailVerificationActionType.HIDE_MODAL_CHALLENGE
    });
  }, [dispatch]);

  const handleRejectAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: EmailVerificationActionType.SHOW_MODAL_CHALLENGE
    });
  }, [dispatch]);

  const handleConfirmAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: EmailVerificationActionType.SET_CHALLENGE_INVALIDATED,
      errorCode: 0
    });

    metricsService.fireChallengeInvalidatedEvent();
    eventService.sendChallengeInvalidatedEvent();
  }, [dispatch, eventService, metricsService]);

  const loadChallenge = () => {
    if (EmailVerifyCodeModalService) {
      EmailVerifyCodeModalService.renderEmailVerifyCodeModal({
        containerId: OTP_CONTAINER_ID,
        codeLength: otpCodeLength,
        onEmailCodeEntered: (sessionToken: string, code: string) => {
          dispatch({
            type: EmailVerificationActionType.SET_CHALLENGE_COMPLETED,
            onChallengeCompletedData: {
              otpSession: sessionToken
            }
          });
          eventService.sendChallengeCompletedEvent();
          metricsService.fireChallengeCompletedEvent();
        },
        onModalAbandoned,
        enterEmailTitle: resources.Header.VerifyYourAccount,
        enterEmailDescription: resources.Description.SuspiciousActivityEmailVerification,
        enterCodeTitle: resources.Header.EnterCode,
        enterCodeDescription: resources.Description.EnterCode,
        origin: Otp.Origin.Challenge,
        translate
      });
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      // eslint-disable-next-line no-void
      void loadChallenge();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [isModalVisible]);

  /*
   * Rendering helper
   */
  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;

    return (
      <React.Fragment>
        <BodyElement>
          <div id={OTP_CONTAINER_ID} />
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

export default EmailVerification;
