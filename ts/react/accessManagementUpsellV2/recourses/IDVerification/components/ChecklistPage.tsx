/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import React from 'react';
import { Button, Modal } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import { deviceMeta } from 'header-scripts';
import { selectIDVState } from '../verificationSlice';
import { ReportEvent, Recourse, VerificationStatusCode } from '../../../enums';
import reportEvent from '../../../services/reportEventService';
import {
  ActionConstants,
  LabelConstants,
  VerificationChecklistStep
} from '../constants/textConstants';

function ChecklistPage({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): React.ReactElement {
  const IDVStore = useSelector(selectIDVState);
  const { status, vendorVerificationData } = IDVStore;
  const { sessionStatus } = status;
  const { qrCode } = vendorVerificationData;

  const deviceMetaData = deviceMeta.getDeviceMeta();
  const isMobile =
    deviceMetaData?.isPhone || deviceMetaData?.isTablet || deviceMetaData?.deviceType === 'phone';
  const showQRImg = !isMobile && qrCode;

  const linkClicked = () => {
    reportEvent(ReportEvent.VerificationStarted, Recourse.GovernmentId, {
      session: vendorVerificationData.sessionIdentifier
    });
  };
  const currentStatusIndex = VerificationChecklistStep.findIndex(step =>
    step.statusCode.includes(sessionStatus)
  );

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
            sessionStatus === VerificationStatusCode.Success ||
              sessionStatus === VerificationStatusCode.Stored ||
              sessionStatus === VerificationStatusCode.Submitted
              ? LabelConstants.VerificationDataSubmitted
              : LabelConstants.VerifyInBrowser
          )}
        </div>
        <ul className='checklist-wrapper'>
          {VerificationChecklistStep.map((step, index) =>
            index <= currentStatusIndex ? (
              <li className='checklist-item'>
                <span className='check-wrapper'>
                  <span
                    className={
                      index === currentStatusIndex ? 'spinner spinner-sm' : 'icon-checkmark'
                    }
                  />
                </span>
                <span className='checklist-text'>{translate(step.label)}</span>
              </li>
            ) : null
          )}
        </ul>

        {showQRImg && (
          <div className='verification-link-page-content'>
            <div className='qr-code-wrapper'>
              <img className='qr-code-img' src={qrCode} alt='qr' />
            </div>
            <div className='footer-text'>{translate(LabelConstants.HavingTroubleScanCode)}</div>
          </div>
        )}
        {!showQRImg && (
          <a href={vendorVerificationData.verificationLink} target='_blank' rel='noreferrer'>
            <Button
              onClick={linkClicked}
              className='primary-link'
              variant={Button.variants.primary}
              size={Button.sizes.medium}
              width={Button.widths.full}>
              {translate(ActionConstants.RestartSession)}
            </Button>
          </a>
        )}
        <div className='footer-text'>{translate(LabelConstants.PleaseDoNotClose)}</div>
      </Modal.Body>
    </React.Fragment>
  );
}

export default ChecklistPage;
