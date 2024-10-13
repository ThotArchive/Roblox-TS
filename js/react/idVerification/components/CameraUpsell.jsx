import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Modal } from 'react-style-guide';
import LockIcon from '../../../../images/idVerification/lock_xxlarge@3x.png';
import CameraIcon from '../../../../images/idVerification/avatarchat_large@3x.png';
import HeartsIcon from '../../../../images/idVerification/hearts_large@3x.png';
import useCameraConsentForm from './useCameraConsentForm';
import { sendChatEvent, recordUserSeenAvatarVideoUpsellModal } from '../services/voiceChatService';
import events from '../constants/idVerificationEventStreamConstants';

const ICON_SIZE = 60;

function CameraUpsell({
  translate,
  title,
  animateYourAvatar,
  communityStandards,
  implicitConsent,
  explicitConsent,
  requireExplicitCameraConsent,
  learnMore,
  facialPrivacyUrl,
  buttons,
  cameraPrivacy,
  useCameraU13Design
}) {
  const [checkbox, buttonMarkup] = useCameraConsentForm(
    translate,
    implicitConsent,
    explicitConsent,
    requireExplicitCameraConsent,
    buttons
  );

  useEffect(() => {
    sendChatEvent(events.showUnifiedChatUpsellModal);
    recordUserSeenAvatarVideoUpsellModal();
  }, []);

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>{translate(title)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={CameraIcon} alt='' />
            <p className='legal-enable-page-row-label'>{translate(animateYourAvatar)}</p>
          </div>
          <div className='legal-enable-page-row'>
            <img
              width={ICON_SIZE}
              height={ICON_SIZE}
              src={useCameraU13Design ? LockIcon : HeartsIcon}
              alt=''
            />
            <p className='legal-enable-page-row-label'>
              {translate(useCameraU13Design ? cameraPrivacy : communityStandards)}
            </p>
          </div>
        </div>
        {checkbox}
      </Modal.Body>
      <Modal.Footer>
        <div className='half-flex-container'>{buttonMarkup}</div>
      </Modal.Footer>
      <div className='text-footer legal-enable-page-text-footer border-top'>
        <span>
          <div className='icon-moreinfo' />
          <a
            className='text-link legal-enable-page-text-footer-link'
            target='_blank'
            rel='noreferrer'
            href={facialPrivacyUrl}
            onClick={() => sendChatEvent(events.learnMoreAvatarVideo)}>
            {translate(learnMore)}
          </a>
        </span>
      </div>
    </React.Fragment>
  );
}

CameraUpsell.propTypes = {
  translate: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  animateYourAvatar: PropTypes.string.isRequired,
  communityStandards: PropTypes.string.isRequired,
  implicitConsent: PropTypes.string.isRequired,
  explicitConsent: PropTypes.string.isRequired,
  learnMore: PropTypes.string.isRequired,
  facialPrivacyUrl: PropTypes.string.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.object).isRequired,
  requireExplicitCameraConsent: PropTypes.bool.isRequired,
  cameraPrivacy: PropTypes.string.isRequired,
  useCameraU13Design: PropTypes.bool.isRequired
};

export default CameraUpsell;
