import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { phoneUpsellStrings } from '../../common/constants/translationConstants';
import { SET_ERROR_MESSAGE } from '../actions/actionTypes';
import usePhoneUpsellState from '../hooks/usePhoneUpsellState';
import { deletePhoneNumber } from '../services/phoneService';
import InputFieldError from './InputFieldError';
import getErrorCodeFromRequestError from '../../common/utils/requestUtils';
import { getErrorMessageFromSubmissionErrorCode } from '../utils/errorUtils';

function DeletePhoneNumber({ translate, existingPhoneNumber, onHide }) {
  const { dispatch } = usePhoneUpsellState();
  const {
    HeadingDeletePhone,
    DescriptionDeletePhone,
    ActionDeletePhonePrimary,
    ActionDeletePhoneSecondary
  } = phoneUpsellStrings;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteClick = async () => {
    setIsSubmitting(true);
    await deletePhoneNumber()
      .then(() => {
        onHide();
      })
      .catch(err => {
        const errorCode = getErrorCodeFromRequestError(err);
        dispatch({
          type: SET_ERROR_MESSAGE,
          errorMessage: getErrorMessageFromSubmissionErrorCode(errorCode)
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const last4Digits = existingPhoneNumber.match(/\d+$/);

  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='verification-upsell-title-container'>
          <Modal.Title id='verification-upsell-modal-title'>
            {translate(HeadingDeletePhone)}
          </Modal.Title>
        </div>
        <button type='button' className='close close-button' onClick={onHide}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className='phone-number-verification-text-body text-description'>
          {translate(DescriptionDeletePhone, { phoneLast4: last4Digits })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <InputFieldError translate={translate} />
        <Button
          className='delete-phone-btn'
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          isLoading={isSubmitting}
          onClick={handleDeleteClick}>
          {translate(ActionDeletePhonePrimary)}
        </Button>
        <Button
          variant={Button.variants.secondary}
          size={Button.sizes.medium}
          isLoading={isSubmitting}
          onClick={onHide}>
          {translate(ActionDeletePhoneSecondary)}
        </Button>
      </Modal.Footer>
    </div>
  );
}

DeletePhoneNumber.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  existingPhoneNumber: PropTypes.string
};

DeletePhoneNumber.defaultProps = {
  existingPhoneNumber: null
};

export default DeletePhoneNumber;
