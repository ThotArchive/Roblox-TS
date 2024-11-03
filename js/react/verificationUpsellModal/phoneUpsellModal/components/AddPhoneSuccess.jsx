import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-style-guide';
import { phoneUpsellStrings } from '../../common/constants/translationConstants';
import { sendVerificationUpsellEvent } from '../../common/utils/loggingUtils';
import events from '../constants/phoneVerificationEventStreamConstants';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import getSectionValueForPage from '../utils/loggingUtils';

function AddPhoneSuccess({ translate, onHide, headingKey, descriptionKey }) {
  const { phoneUpsellState } = usePhoneUpsellState();
  const { origin, pageName } = phoneUpsellState;
  const { ActionDone } = phoneUpsellStrings;

  const section = getSectionValueForPage(pageName);

  const handleDoneClick = () => {
    sendVerificationUpsellEvent(events.phoneAddedDonePressed, {
      origin,
      section
    });
    onHide();
  };

  return (
    <div>
      <Modal.Body>
        <div className='phone-number-verification-upsell-image' />
        <div className='verification-upsell-title-container phone-number-verification-success-page-title page-title'>
          <Modal.Title id='verification-upsell-modal-title'>{translate(headingKey)}</Modal.Title>
        </div>
        <div className='phone-number-verification-text-body text-description'>
          {translate(descriptionKey)}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type='button'
          className='btn-cta-md btn-max-width phone-number-verify-button'
          onClick={handleDoneClick}>
          {translate(ActionDone)}
        </button>
      </Modal.Footer>
    </div>
  );
}

AddPhoneSuccess.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  headingKey: PropTypes.string,
  descriptionKey: PropTypes.string
};

AddPhoneSuccess.defaultProps = {
  headingKey: phoneUpsellStrings.HeadingPhoneIsVerified,
  descriptionKey: phoneUpsellStrings.DescriptionPhoneForRecovery
};

export default AddPhoneSuccess;
