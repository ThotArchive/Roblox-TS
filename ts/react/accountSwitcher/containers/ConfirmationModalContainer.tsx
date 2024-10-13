import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import { AccountSwitcherBaseConfirmationModal } from '../components/AccountSwitcherBaseConfirmationModal';

export type confirmationModalContainerProps = {
  origin: string;
  localizedTitleText: string;
  localizedBodyText: string;
  primaryButtonCallback?: () => void;
  localizedPrimaryButtonText?: string;
  secondaryButtonCallback?: () => void;
  localizedSecondaryButtonText?: string;
  isModalDismissable: boolean;
};

export const ConfirmationModalContainer = ({
  origin,
  localizedTitleText,
  localizedBodyText,
  primaryButtonCallback,
  localizedPrimaryButtonText,
  secondaryButtonCallback,
  localizedSecondaryButtonText,
  isModalDismissable
}: confirmationModalContainerProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleModalAbandoned = () => {
    if (isModalDismissable) {
      setIsModalOpen(false);
    }
  };
  return (
    <Modal
      className='account-switcher-modal confirmation-modal'
      show={isModalOpen}
      onHide={handleModalAbandoned}
      size='sm'>
      <AccountSwitcherBaseConfirmationModal
        origin={origin}
        localizedTitleText={localizedTitleText}
        localizedBodyText={localizedBodyText}
        primaryButtonCallback={() => {
          // TODO add click logging
          if (primaryButtonCallback) {
            primaryButtonCallback();
          }
          setIsModalOpen(false);
        }}
        localizedPrimaryButtonText={localizedPrimaryButtonText}
        secondaryButtonCallback={() => {
          // TODO add click logging
          if (secondaryButtonCallback) {
            secondaryButtonCallback();
          }
          setIsModalOpen(false);
        }}
        localizedSecondaryButtonText={localizedSecondaryButtonText}
        onClose={handleModalAbandoned}
      />
    </Modal>
  );
};

export default ConfirmationModalContainer;
