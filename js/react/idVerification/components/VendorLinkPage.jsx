import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import events from '../constants/idVerificationEventStreamConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';
import { ModalEntry } from '../constants/viewConstants';

function VendorLinkPage({
  translate,
  onHide,
  verificationLink,
  useQRCode,
  origin,
  entry,
  redirectUrl
}) {
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
  // VPC requires a in-place redirection
  const mobileLinkTarget =
    entry === ModalEntry.VPC || entry === ModalEntry.parentalVerification ? '_self' : '_blank';
  const mobileLink =
    entry === ModalEntry.VPC || ModalEntry.parentalVerification
      ? `${verificationLink}&redirect-uri=${encodeURIComponent(redirectUrl)}`
      : verificationLink;

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
      <Modal.Body className='verification-link-page-content'>
        <div className='verification-link-upsell'>{translate('Label.AgeVerifyPrompt')}</div>
        <div className='preparation-list-wrapper'>
          <div className='preparation-list-item'>
            <span className='icon-menu-document' />
            <div className='preparation-list-text'>
              <div className='preparation-title'>{translate('Label.PrepareId')}</div>
              <div className='preparation-text'>{translate('Label.ValidIdList')}</div>
            </div>
          </div>
          {showQRImg && (
            <div className='preparation-list-item'>
              <span className='icon-menu-mobile' />
              <div className='preparation-list-text'>
                <div className='preparation-title'>{translate('Label.UseSmartphone')}</div>
                <div className='preparation-text'>{translate('Label.SmartphoneRequired')}</div>
              </div>
            </div>
          )}
        </div>
        {showQRImg && (
          <div>
            <div className='verification-link-upsell'>{translate('Label.ScanQRCode')}</div>
            <div className='qr-code-wrapper'>
              <img className='qr-code-img' src={qrImgSrc} alt='qr' />
            </div>
          </div>
        )}
        <p
          className='verification-link-legal'
          dangerouslySetInnerHTML={{
            __html: translate('Label.PrivacyNoticeAndLink', {
              spanStart:
                "<a class='text-link' href='https://en.help.roblox.com/hc/en-us/articles/4412863575316'>",
              spanEnd: '</a>'
            })
          }}
        />
        {!showQRImg && (
          <a href={mobileLink} onClick={linkClicked} target={mobileLinkTarget} rel='noreferrer'>
            <Button
              className='primary-link'
              variant={Button.variants.primary}
              size={Button.sizes.medium}
              width={Button.widths.full}>
              {translate('Action.StartSession')}
            </Button>
          </a>
        )}
      </Modal.Body>
    </React.Fragment>
  );
}

VendorLinkPage.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  verificationLink: PropTypes.string.isRequired,
  useQRCode: PropTypes.bool.isRequired,
  origin: PropTypes.string.isRequired,
  entry: PropTypes.string.isRequired,
  redirectUrl: PropTypes.string
};
VendorLinkPage.defaultProps = {
  redirectUrl: ''
};

export default VendorLinkPage;
