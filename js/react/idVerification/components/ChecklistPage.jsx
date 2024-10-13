import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import events from '../constants/idVerificationEventStreamConstants';
import { VerificationChecklistStep } from '../constants/viewConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';

function ChecklistPage({ translate, onHide, verificationLink, useQRCode, checklistStep, origin }) {
  const [qrImgSrc, setQRImgSrc] = useState();
  const [showQRImg, setShowQRImg] = useState(false);
  useEffect(() => {
    async function fetchQRCode() {
      let url;
      try {
        url = await QRCode.toDataURL(verificationLink, { errorCorrectionLevel: 'H' });
        setQRImgSrc(url);
      } catch (err) {
        throw new Error(err);
      } finally {
        setShowQRImg(useQRCode && url);
      }
    }
    fetchQRCode();
  }, [useQRCode, verificationLink]);

  const linkClicked = () => {
    sendIdVerificationEvent(events.verificationLinkClicked, {
      origin
    });
  };

  const stepKey = [
    'Label.ConnectingToMobile',
    'Label.VerifyingYou',
    'Label.VerificationWaitingForResults',
    'Label.UpdatingRoblox'
  ];
  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.IdentityVerification')}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className='verification-checklist-page-content'>
        <div className='cta'>
          {translate(
            checklistStep === VerificationChecklistStep.Connecting ||
              checklistStep === VerificationChecklistStep.Verifying
              ? 'Label.VerifyInBrowser'
              : 'Label.VerificationDataSubmitted'
          )}
        </div>
        <ul className='checklist-wrapper'>
          {stepKey.map((key, index) =>
            index <= checklistStep ? (
              <li className='checklist-item'>
                <span className='check-wrapper'>
                  <span
                    className={index === checklistStep ? 'spinner spinner-sm' : 'icon-checkmark'}
                  />
                </span>
                <span className='checklist-text'>{translate(key)}</span>
              </li>
            ) : null
          )}
        </ul>

        {showQRImg && (
          <div className='verification-link-page-content'>
            <div className='qr-code-wrapper'>
              <img className='qr-code-img' src={qrImgSrc} alt='qr' />
            </div>
            <div className='footer-text'>{translate('Label.HavingTroubleScanCode')}</div>
          </div>
        )}
        {!showQRImg && (
          <a href={verificationLink} onClick={linkClicked} target='_blank' rel='noreferrer'>
            <Button
              className='primary-link'
              variant={Button.variants.primary}
              size={Button.sizes.medium}
              width={Button.widths.full}>
              {translate('Action.RestartSession')}
            </Button>
          </a>
        )}
        <div className='footer-text'>{translate('Label.PleaseDoNotClose')}</div>
      </Modal.Body>
    </React.Fragment>
  );
}

ChecklistPage.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  verificationLink: PropTypes.string.isRequired,
  useQRCode: PropTypes.bool.isRequired,
  checklistStep: PropTypes.number.isRequired,
  origin: PropTypes.string.isRequired
};

export default ChecklistPage;
