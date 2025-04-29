/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import React from 'react';
import { Button, Loading, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { useSelector } from 'react-redux';
import { deviceMeta } from 'header-scripts';
import { selectIDVState } from '../verificationSlice';
import { ActionConstants, LabelConstants } from '../constants/textConstants';

function VendorlinkPage({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): React.ReactElement {
  // VPC requires a in-place redirection - should explore having in-place redirection for all mobile entry
  const mobileLinkTarget = '_self';
  const IDVStore = useSelector(selectIDVState);
  const { vendorVerificationData } = IDVStore;
  const { loading, qrCode } = vendorVerificationData;
  const deviceMetaData = deviceMeta.getDeviceMeta();

  const isMobile =
    deviceMetaData?.isPhone || deviceMetaData?.isTablet || deviceMetaData?.deviceType === 'phone';
  const showQRImg = !isMobile && qrCode;

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <button type='button' className='email-upsell-title-button' onClick={onHide}>
          <span className='close icon-close' />
        </button>
        <div className='email-upsell-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.IdentityVerification')}
          </Modal.Title>
        </div>
      </Modal.Header>
      {loading ? (
        <Loading />
      ) : (
        <Modal.Body className='verification-link-page-content'>
          <div className='verification-link-upsell'>
            {translate(LabelConstants.AgeVerifyPrompt)}
          </div>
          <div className='preparation-list-wrapper'>
            <div className='preparation-list-item'>
              <span className='icon-menu-document' />
              <div className='preparation-list-text'>
                <div className='preparation-title'>{translate(LabelConstants.PrepareId)}</div>
                <div className='preparation-text'>{translate(LabelConstants.ValidIdList)}</div>
              </div>
            </div>
            {showQRImg && (
              <div className='preparation-list-item'>
                <span className='icon-menu-mobile' />
                <div className='preparation-list-text'>
                  <div className='preparation-title'>{translate(LabelConstants.UseSmartphone)}</div>
                  <div className='preparation-text'>
                    {translate(LabelConstants.SmartphoneRequired)}
                  </div>
                </div>
              </div>
            )}
          </div>
          {showQRImg && (
            <div>
              <div className='verification-link-upsell'>{translate(LabelConstants.ScanQRCode)}</div>
              <div className='qr-code-wrapper'>
                <img className='qr-code-img' src={qrCode} alt='qr' />
              </div>
            </div>
          )}
          <p
            className='verification-link-legal'
            dangerouslySetInnerHTML={{
              __html: translate(LabelConstants.PrivacyNoticeAndLink, {
                spanStart:
                  "<a class='text-link' href='https://en.help.roblox.com/hc/en-us/articles/4412863575316'>",
                spanEnd: '</a>'
              })
            }}
          />
          {!showQRImg && (
            <a
              href={vendorVerificationData.verificationLink}
              target={mobileLinkTarget}
              rel='noreferrer'>
              <Button
                onClick={() => console.log('start sesesion')}
                className='primary-link'
                variant={Button.variants.primary}
                size={Button.sizes.medium}
                width={Button.widths.full}>
                {translate(ActionConstants.StartSession)}
              </Button>
            </a>
          )}
        </Modal.Body>
      )}
    </React.Fragment>
  );
}

export default VendorlinkPage;
