import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Button, Modal } from 'react-style-guide';
import HeartsIcon from '../../../../images/idVerification/hearts_large@3x.png';
import VoiceChatIcon from '../../../../images/idVerification/voicechat_large@3x.png';
import events from '../constants/idVerificationEventStreamConstants';
import { recordUserSeenUpsellModal, sendChatEvent } from '../services/voiceChatService';
import useVoiceConsentForm from './useVoiceConsentForm';

const ICON_SIZE = 60;

function VoiceUpsell({
  translate,
  communityStandardsUrl,
  voiceFAQUrl,
  requireExplicitVoiceConsent,
  heading,
  enableVoiceChat,
  followCommunityStandards,
  implicitConsent,
  explicitConsent,
  learnMoreAboutVoiceRecording,
  buttonStack,
  useVoiceUpsellV2Design
}) {
  const [checkbox, buttons] = useVoiceConsentForm(
    translate,
    buttonStack,
    implicitConsent,
    explicitConsent,
    requireExplicitVoiceConsent
  );

  useEffect(() => {
    sendChatEvent(events.showEnableVoiceChatModal);
    recordUserSeenUpsellModal();
  }, []);

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>{translate(heading)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={VoiceChatIcon} alt='' />
            <p className='legal-enable-page-row-label'>{translate(enableVoiceChat)}</p>
          </div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={HeartsIcon} alt='' />
            <p
              className='legal-enable-page-row-label'
              dangerouslySetInnerHTML={{
                __html: translate(followCommunityStandards, {
                  linkStart: `<a class="text-name" target="_blank" rel="noreferrer" href=${communityStandardsUrl}>`,
                  linkEnd: '</a>'
                })
              }}
            />
          </div>
        </div>
        {checkbox}
      </Modal.Body>
      <Modal.Footer>{buttons}</Modal.Footer>
      <div className='text-footer legal-enable-page-text-footer border-top'>
        <span>
          <div className='icon-moreinfo' />
          <a
            className='text-link legal-enable-page-text-footer-link'
            target='_blank'
            rel='noreferrer'
            href={voiceFAQUrl}
            onClick={() =>
              useVoiceUpsellV2Design && sendChatEvent(events.learnMoreAboutVoiceRecordingUpsell)
            }>
            {translate(learnMoreAboutVoiceRecording)}
          </a>
        </span>
      </div>
    </React.Fragment>
  );
}

VoiceUpsell.propTypes = {
  translate: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired,
  enableVoiceChat: PropTypes.string.isRequired,
  followCommunityStandards: PropTypes.string.isRequired,
  buttonStack: PropTypes.arrayOf(
    PropTypes.shape({
      variant: PropTypes.oneOf(Button.variants),
      text: PropTypes.string,
      callback: PropTypes.func,
      explicitDisable: PropTypes.bool
    })
  ).isRequired,
  implicitConsent: PropTypes.string.isRequired,
  explicitConsent: PropTypes.string.isRequired,
  requireExplicitVoiceConsent: PropTypes.bool.isRequired,
  learnMoreAboutVoiceRecording: PropTypes.string.isRequired,
  communityStandardsUrl: PropTypes.string.isRequired,
  voiceFAQUrl: PropTypes.string.isRequired,
  useVoiceUpsellV2Design: PropTypes.bool.isRequired
};

export default VoiceUpsell;
