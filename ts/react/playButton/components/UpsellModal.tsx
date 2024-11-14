import React from 'react';
import { Modal, Button } from 'react-style-guide';

type TUpsellModalProps = {
  titleText: string;
  bodyText: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  modalSize?: 'xs' | 'sm' | 'md' | 'lg';
};

/**
 * Renders a generic upsell modal with a title, body, and up to two buttons.
 * The primary and secondary buttons are only displayed if the
 * corresponding text and click handlers are provided.
 */
const UpsellModal = ({
  titleText,
  bodyText,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  isModalOpen,
  onCloseModal,
  modalSize
}: TUpsellModalProps): JSX.Element => {
  return (
    <Modal
      show={isModalOpen}
      onHide={onCloseModal}
      size={modalSize}
      aria-labelledby='upsell-modal-title'
      className='upsell-modal-container'
      centered='true'>
      <Modal.Header useBaseBootstrapComponent>
        <button type='button' className='close' onClick={onCloseModal}>
          <span className='icon-close' />
        </button>
        <Modal.Title id='upsell-modal-title'>{titleText}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyText}</Modal.Body>
      <Modal.Footer>
        {secondaryButtonText && onSecondaryButtonClick && (
          <Button
            variant={Button.variants.secondary}
            size={Button.sizes.medium}
            onClick={onSecondaryButtonClick}
            className='modal-button'>
            {secondaryButtonText}
          </Button>
        )}
        {primaryButtonText && onPrimaryButtonClick && (
          <Button
            variant={Button.variants.primary}
            size={Button.sizes.medium}
            onClick={onPrimaryButtonClick}
            className='modal-button'>
            {primaryButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

UpsellModal.defaultProps = {
  primaryButtonText: undefined,
  secondaryButtonText: undefined,
  onPrimaryButtonClick: undefined,
  onSecondaryButtonClick: undefined,
  modalSize: 'sm'
};

export default UpsellModal;
