import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import { VerificationStatusCode } from '../../../enums';
import { selectIDVState } from '../verificationSlice';

function VerificationCompletePage({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): React.ReactElement {
  const IDVStore = useSelector(selectIDVState);
  const { completionPageState, status, vendorVerificationData } = IDVStore;
  const { daysUntilNextVerification } = vendorVerificationData;
  const { heading, bodyText, icon, footerText, buttonText } = completionPageState;
  const errorState = status.sessionStatus === VerificationStatusCode.Failure;
  const minimumAge = 18;

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>{translate(heading)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        {icon && <div className={icon} />}
        <ul className={errorState ? 'content-list error-text' : 'content-list'}>
          {bodyText.map(text => {
            return <li>{translate(text, { age: minimumAge, days: daysUntilNextVerification })}</li>;
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        {footerText && (
          <p className='small'>
            <b>{translate(footerText)}</b>
          </p>
        )}
        <span key={buttonText}>
          <Button
            className='button-stack-button primary-link'
            variant={Button.variants.primary}
            size={Button.sizes.medium}
            onClick={onHide}>
            {translate(buttonText)}
          </Button>
        </span>
      </Modal.Footer>
    </React.Fragment>
  );
}

export default VerificationCompletePage;
