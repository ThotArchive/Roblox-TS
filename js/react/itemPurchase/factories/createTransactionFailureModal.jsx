import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { createModal } from 'react-style-guide';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';

const { resources } = itemPurchaseConstants;

export default function createTransactionFailureModal() {
  const [Modal, modalService] = createModal();
  function TransactionFailureModal({ translate, title, message, onDecline }) {
    const body = <div className='modal-message'>{message}</div>;
    return (
      <Modal
        {...{
          title,
          body,
          thumbnail: <span className='icon-warning-orange-150x150' />,
          neutralButtonText: translate(resources.okAction),
          onNeutral: onDecline
        }}
      />
    );
  }

  TransactionFailureModal.defaultProps = {
    onDecline: null
  };

  TransactionFailureModal.propTypes = {
    translate: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onDecline: PropTypes.func
  };
  return [
    withTranslations(TransactionFailureModal, translationConfig.purchasingResources),
    modalService
  ];
}
